import fs from "node:fs/promises";import path from "node:path";import JSZip from "jszip";import {PDFDocument} from "pdf-lib";import mammoth from "mammoth";
export const E={PDF:".pdf",HTML:".html",APK:".apk",ZIP:".zip",DOCX:".docx",TXT:".txt"};
export const M={PDF:"application/pdf",HTML:"text/html; charset=utf-8",APK:"application/vnd.android.package-archive",ZIP:"application/zip",DOCX:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",TXT:"text/plain; charset=utf-8"};
export async function validateOutput(f,fmt){
 const s=await fs.stat(f).catch(()=>null);if(!s||s.size<1||path.extname(f).toLowerCase()!==E[fmt])throw Error("OUTPUT_VALIDATION_FAILED");
 if(fmt==="PDF")await PDFDocument.load(await fs.readFile(f));
 else if(fmt==="ZIP"||fmt==="APK")await JSZip.loadAsync(await fs.readFile(f));
 else if(fmt==="DOCX")await mammoth.extractRawText({path:f});
 else if(fmt==="HTML"&&!/(<html[\s>]|<body[\s>])/i.test(await fs.readFile(f,"utf8")))throw Error("OUTPUT_VALIDATION_FAILED");
 else if(fmt==="TXT")await fs.readFile(f,"utf8");
 return {size:s.size,mime:M[fmt]};
}