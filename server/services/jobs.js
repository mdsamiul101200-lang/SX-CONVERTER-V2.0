import crypto from "node:crypto";
const jobs=new Map();
export function createJob(x){const id=crypto.randomUUID();const j={id,status:"QUEUED",createdAt:Date.now(),...x};jobs.set(id,j);return j}
export function getJob(id){return jobs.get(id)}
export function updateJob(id,x){const j=jobs.get(id);if(j)Object.assign(j,x);return j}
export function deleteJob(id){jobs.delete(id)}
