import fs from "node:fs/promises";
import path from "node:path";
import {run} from "../services/command.js";
import {extractSafe} from "./zip.js";
const T=path.join(process.cwd(),"android/template");
export async function webToApk(i,o,w,name="SX Converter"){
  const p=path.join(w,"android-project");
  await fs.cp(T,p,{recursive:true});
  const a=path.join(p,"app/src/main/assets");
  await fs.mkdir(a,{recursive:true});
  await fs.copyFile(i,path.join(a,"index.html"));
  const m=path.join(p,"app/src/main/AndroidManifest.xml");
  await fs.writeFile(m,(await fs.readFile(m,"utf8")).replaceAll("__APP_NAME__",name.replace(/[<>&'"]/g,"")));
  await run("./gradlew",["assembleDebug"],{cwd:p,timeout:300000});
  await fs.copyFile(path.join(p,"app/build/outputs/apk/debug/app-debug.apk"),o);
}
export async function zipToApk(i,o,w){
  const f=await extractSafe(i,path.join(w,"site"));
  const h=f.find(x=>path.basename(x).toLowerCase()==="index.html")||f.find(x=>/\.html?$/i.test(x));
  if(!h)throw Error("CONVERSION_FAILED");
  await webToApk(h,o,w,path.parse(h).name);
}