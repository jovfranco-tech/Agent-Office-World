#!/usr/bin/env node
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, isAbsolute } from "node:path";

const BASE="5bbae9ac0e607dadb1bb4e599d3a1585ca8608a8";
function fail(m,c=2){process.stderr.write("AGENT OFFICE P2 RUNNER BLOCKED: "+m+"\n");process.exit(c);}
function git(repo,args){return execFileSync("git",["-C",repo,...args],{encoding:"utf8"}).trim();}
function run(repo,cmd,args,timeout=20*60*1000){
 const r=spawnSync(cmd,args,{cwd:repo,encoding:"utf8",timeout,maxBuffer:96*1024*1024,env:{...process.env,CI:"1"}});
 return {command:[cmd,...args].join(" "),exitCode:r.status,passed:r.status===0,
 stdoutSha256:createHash("sha256").update(r.stdout||"").digest("hex"),
 stderrSha256:createHash("sha256").update(r.stderr||"").digest("hex"),
 stdoutExcerpt:r.status===0?String(r.stdout||"").slice(-12000):undefined,
 failureExcerpt:r.status===0?undefined:String((r.stdout||"")+"\n"+(r.stderr||"")).split(/\r?\n/).slice(-140).join("\n").slice(-12000)};
}
const argv=process.argv.slice(2),get=f=>{const i=argv.indexOf(f);return i>=0?argv[i+1]:undefined};
const repo=get("--repo"),report=get("--report"),expected=get("--expected-head")||BASE;
if(!repo||!report||!isAbsolute(repo)||!isAbsolute(report)) fail("absolute --repo and --report required");
const root=resolve(repo);
if(git(root,["rev-parse","HEAD"])!==expected) fail("HEAD mismatch");
if(git(root,["status","--porcelain=v1"])) fail("candidate dirty");
const tree=git(root,["rev-parse","HEAD^{tree}"]);

const probe=resolve(root,"aem-agent-office-p2-probe.ts");
writeFileSync(probe,`
import assert from "node:assert/strict";
import { initialSnapshot, simulateHour } from "./src/lib/simulation.ts";

const OriginalDate=Date;
const originalRandom=Math.random;

function withRandomSequence(seq:number[],fn:()=>any){
 let i=0;
 Math.random=()=>seq[(i++)%seq.length];
 try{return fn();}finally{Math.random=originalRandom;}
}
function withWallClock(iso:string,fn:()=>any){
 const fixed=new OriginalDate(iso).valueOf();
 // @ts-ignore audit-only controlled clock
 globalThis.Date=class extends OriginalDate{
   constructor(...args:any[]){super(...(args.length?args:[fixed]) as [any]);}
   static now(){return fixed;}
 } as DateConstructor;
 try{return fn();}finally{globalThis.Date=OriginalDate;}
}
const seqA=[0.01,0.15,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.95,0.12,0.32,0.52,0.72,0.92];
const seqB=[0.91,0.81,0.71,0.61,0.51,0.41,0.31,0.21,0.11,0.01,0.88,0.68,0.48,0.28,0.08];

const baseA=initialSnapshot();
const baseB=initialSnapshot();
const outA=withWallClock("2026-10-06T10:00:00.000Z",()=>withRandomSequence(seqA,()=>simulateHour(baseA)));
const outB=withWallClock("2026-10-06T10:00:00.000Z",()=>withRandomSequence(seqB,()=>simulateHour(baseB)));
assert.notDeepEqual(outA,outB,"same initial state with different random streams should diverge");

const same1=withWallClock("2026-10-06T10:00:00.000Z",()=>withRandomSequence(seqA,()=>simulateHour(initialSnapshot())));
const same2=withWallClock("2026-10-06T22:30:00.000Z",()=>withRandomSequence(seqA,()=>simulateHour(initialSnapshot())));
const normalize=(x:any)=>({
 agents:x.agents,
 events:x.events.map((e:any)=>({...e,id:e.id.replace(/evt-\\d+-/,"evt-TIME-"),time:"WALLCLOCK"}))
});
assert.deepEqual(normalize(same1),normalize(same2),"same RNG stream should otherwise produce same simulation state");
assert.notDeepEqual(same1.events.map((e:any)=>e.time),same2.events.map((e:any)=>e.time),"event display timestamps should change with browser wall clock");
assert.notDeepEqual(same1.events.map((e:any)=>e.id),same2.events.map((e:any)=>e.id),"event IDs should change with Date.now wall clock");

const readme=await import("node:fs").then(m=>m.readFileSync("./README.md","utf8"));
assert.match(readme,/deterministic simulation/i);
assert.match(readme,/Deterministic before autonomous/i);

process.stdout.write(JSON.stringify({
 stochasticDivergenceProven:true,
 sameRandomDifferentWallClockChangesEventTime:true,
 sameRandomDifferentWallClockChangesEventId:true,
 deterministicClaimPresent:true,
 eventsAtMorning:same1.events.slice(0,3).map((e:any)=>({id:e.id,time:e.time,message:e.message})),
 eventsAtEvening:same2.events.slice(0,3).map((e:any)=>({id:e.id,time:e.time,message:e.message}))
},null,2));
`);

const checks=[];
try{
 checks.push(run(root,"npm",["ci"]));
 checks.push(run(root,"npm",["run","typecheck"]));
 checks.push(run(root,"npm",["run","build"]));
 checks.push(run(root,"npx",["--yes","tsx","aem-agent-office-p2-probe.ts"]));
 const obj={schema:"AEM_AGENT_OFFICE_WORLD_P2_EXECUTION_V01",generatedAt:new Date().toISOString(),
 repository:"jovfranco-tech/Agent-Office-World",head:expected,tree,
 environment:"GITHUB_ACTIONS_LOCAL_SIMULATION_NO_NETWORK_NO_PROVIDER",
 checks,
 assertions:{
  installPassed:checks[0]?.passed===true,typecheckPassed:checks[1]?.passed===true,buildPassed:checks[2]?.passed===true,
  reproducibilityProbePassed:checks[3]?.passed===true,
  stochasticDivergenceProven:checks[3]?.passed===true,
  wallClockInjectionProven:checks[3]?.passed===true,
  exhaustiveAuditCompleted:false
 },
 explicitNonClaims:{realAgentAction:false,realLLMCalled:false,realTelemetryUsed:false,customerDataUsed:false,productionDeploymentTested:false,independentAdjudicationCompleted:false}};
 writeFileSync(report,JSON.stringify(obj,null,2)+"\n",{mode:0o600});
 const sha=createHash("sha256").update(readFileSync(report)).digest("hex");
 process.stdout.write("\n"+JSON.stringify({report,sha256:sha,head:expected,tree,...obj.assertions},null,2)+"\n");
 if(!checks[0].passed||!checks[3].passed) process.exitCode=3;
}finally{
 if(existsSync(probe)) unlinkSync(probe);
 const status=git(root,["status","--porcelain=v1"]);
 if(status){process.stderr.write("POSTFLIGHT DIRTY: "+status+"\n");process.exitCode=4;}
}
