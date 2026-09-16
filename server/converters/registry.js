import fs from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";
import {textToHtml,textToPdf,textToDocx,textToTxt} from "./text.js";
import {JSDOM} from "jsdom";
import {htmlToPdf,htmlToTxt,htmlToDocx,htmlToZip} from "./html.js";
import {pdfToTxt,pdfToHtml,pdfToDocx,pdfToPdf,pdfToZip} from "./pdf.js";
import {docxToTxt,docxToHtml,docxToPdf,docxToDocx,docxToZip} from "./docx.js";
import {zipToHtml,zipToPdf,zipToDocx,zipToTxt,zipToZip} from "./zip.js";
import {apkToHtml,apkToZip} from "./apk.js";
import {webToApk,zipToApk} from "./android.js";
export const converterRegistry={PDF:{},HTML:{},APK:{},ZIP:{},DOCX:{},TXT:{}};
const put=(i,o,fn)=>converterRegistry[i][o]=fn;
put("PDF","PDF",pdfToPdf);put("PDF","HTML",pdfToHtml);put("PDF","TXT",pdfToTxt);put("PDF","DOCX",pdfToDocx);put("PDF","ZIP",pdfToZip);
put("HTML","PDF",htmlToPdf);put("HTML","HTML",async(i,o)=>{const d=new JSDOM(await fs.readFile(i,"utf8"));await fs.writeFile(o,d.serialize())});put("HTML","TXT",htmlToTxt);put("HTML","DOCX",htmlToDocx);put("HTML","ZIP",htmlToZip);put("HTML","APK",webToApk);
put("DOCX","PDF",docxToPdf);put("DOCX","HTML",docxToHtml);put("DOCX","TXT",docxToTxt);put("DOCX","DOCX",docxToDocx);put("DOCX","ZIP",docxToZip);
put("TXT","PDF",async(i,o)=>textToPdf(await fs.readFile(i,"utf8"),o));put("TXT","HTML",async(i,o)=>textToHtml(await fs.readFile(i,"utf8"),o));put("TXT","DOCX",async(i,o)=>textToDocx(await fs.readFile(i,"utf8"),o));put("TXT","TXT",textToTxt);
put("TXT","ZIP",async(i,o)=>{const w=(await import("node:fs")).createWriteStream(o),z=archiver("zip",{zlib:{level:9}});z.pipe(w);z.file(i,{name:"text.txt"});await z.finalize();await new Promise((r,j)=>{w.on("close",r);w.on("error",j)})});
put("ZIP","ZIP",zipToZip);put("ZIP","HTML",zipToHtml);put("ZIP","PDF",zipToPdf);put("ZIP","DOCX",zipToDocx);put("ZIP","TXT",zipToTxt);put("ZIP","APK",zipToApk);
put("APK","HTML",apkToHtml);put("APK","ZIP",apkToZip);
for(const i of ["PDF","HTML","APK","ZIP","DOCX","TXT"])for(const o of ["PDF","HTML","APK","ZIP","DOCX","TXT"])if(!(o in converterRegistry[i]))converterRegistry[i][o]=null;
export async function convert(input,output,i,o,work,name){
  const fn=converterRegistry[i]?.[o];
  if(!fn)throw Error("CONVERSION_FAILED");
  return fn(input,output,work,path.parse(name).name);
}