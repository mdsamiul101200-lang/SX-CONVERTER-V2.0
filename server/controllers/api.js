import path from "node:path";import fs from "node:fs/promises";import crypto from "node:crypto";
import {createJob,getJob,deleteJob} from "../services/jobs.js";import {validateInput} from "../validators/input.js";import {E,M} from "../validators/output.js";import {UPLOADS} from "../storage/paths.js";import {processJob} from "../workers/worker.js";
export const formats=["PDF","HTML","APK","ZIP","DOCX","TXT"];
export async function createConversion(req,res){
 const i=String(req.body.inputFormat||"").toUpperCase(),o=String(req.body.outputFormat||"").toUpperCase();
 if(!formats.includes(i)||!formats.includes(o))return res.status(400).json({error:"INVALID_FILE"});
 let p=req.file?.path;
 if(!p&&req.body.content){p=path.join(UPLOADS,crypto.randomUUID()+(i==="HTML"?".html":".txt"));await fs.writeFile(p,req.body.content)}
 if(!p)return res.status(400).json({error:"INVALID_FILE"});
 const original=req.file?.originalname||(i==="HTML"?"pasted.html":"pasted.txt");
 try{await validateInput({path:p,originalname:original},i)}catch(e){await fs.rm(p,{force:true});return res.status(400).json({error:e.message})}
 const base=path.parse(original).name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,120)||"converted";
 const j=createJob({inputPath:p,originalName:original,inputFormat:i,outputFormat:o,baseName:base});
 queueMicrotask(()=>processJob(j.id));res.status(202).json({id:j.id,status:j.status});
}
export function status(req,res){const j=getJob(req.params.id);if(!j)return res.status(404).json({error:"SERVER ERROR"});res.json({id:j.id,status:j.status,errorCode:j.errorCode,output:j.output&&{filename:j.output.filename,format:j.output.format,size:j.output.size}})}
export function download(req,res){const j=getJob(req.params.id);if(!j||j.status!=="COMPLETED")return res.status(404).send("Not found");res.setHeader("Content-Type",j.output.mime);res.setHeader("Content-Disposition",`attachment; filename="${j.output.filename.replace(/"/g,"")}"`);res.setHeader("Cache-Control","no-store");res.sendFile(path.resolve(j.output.path))}
export async function remove(req,res){const j=getJob(req.params.id);if(j?.inputPath)await fs.rm(j.inputPath,{force:true});if(j?.output?.path)await fs.rm(j.output.path,{force:true});deleteJob(req.params.id);res.status(204).end()}
