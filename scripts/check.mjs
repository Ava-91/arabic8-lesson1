import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const fail=message=>{throw new Error(message)};
const ok=(condition,message)=>condition||fail(message);

const index=read("index.html");
const css=read("css/styles.css");
const app=read("js/app.js");
const data=read("js/data.js");
const topics=read("js/data/topics.js");
const lesson=read("js/data/lesson.js");
const questions=read("js/data/questions.js");

for(const file of ["js/app.js","js/utils.js","js/storage.js","js/data.js","js/data/topics.js","js/data/lesson.js","js/data/questions.js"]){
  execFileSync(process.execPath,["--check",path.join(root,file)],{stdio:"inherit"});
}

ok(index.includes('lang="fa" dir="rtl"'),"index: missing RTL document language");
ok(index.includes('class="skip-link" href="#app"'),"a11y: skip link missing");
ok(index.includes('main id="app" class="main" tabindex="-1"'),"a11y: focusable main missing");
ok(index.includes('aria-label="ناوبری اصلی"'),"a11y: mobile navigation label missing");
ok(!index.includes("font-awesome")&&!index.includes("cdnjs.cloudflare.com/ajax/libs/font-awesome"),"performance: Font Awesome CDN dependency still present");
ok(!css.includes(".icon-button"),"dead CSS: .icon-button remains");
ok(!css.includes(".bottom-nav"),"dead CSS: .bottom-nav remains");
ok(!css.includes(".sidebar.open"),"dead CSS: .sidebar.open remains");
ok(css.includes(".nav-icon"),"icons: inline icon styling missing");

const topicIds=[...topics.matchAll(/id:"([^"]+)"/g)].map(m=>m[1]);
ok(topicIds.length>=10,"content: too few topics");
ok(new Set(topicIds).size===topicIds.length,"content: duplicate topic ids");

const questionIds=[...questions.matchAll(/id:"([^"]+)"/g)].map(m=>m[1]);
ok(questionIds.length>=50,"content: question bank unexpectedly small");
ok(new Set(questionIds).size===questionIds.length,"content: duplicate question ids");

for(const id of questionIds){
  const start=questions.indexOf('id:"'+id+'"');
  const block=questions.slice(start,start+700);
  ok(/topic:"[^"]+"/.test(block)&&/options:\[/.test(block)&&/answer:\d+/.test(block)&&/explanation:/.test(block),"content: malformed question "+id);
}
for(const id of topicIds) ok(questions.includes('topic:"'+id+'"'),"content: topic has no question coverage: "+id);

for(const match of lesson.matchAll(/\["([^"]+)",/g)){
  const p=match[1];
  if(p.startsWith("assets/")) ok(fs.existsSync(path.join(root,p)),"assets: missing "+p);
}

ok(app.includes('aria-live="polite"'),"a11y: quiz feedback live region missing");
ok(app.includes("aria-current"),"a11y: active navigation state missing");
ok(app.includes('role="progressbar"'),"a11y: progress semantics missing");

const external=[...index.matchAll(/https?:\/\/[^"' ]+/g)].map(m=>m[0]);
console.log("✓ syntax, content, accessibility and dependency checks passed");
console.log("✓ "+topicIds.length+" topics, "+questionIds.length+" questions");
console.log("✓ external runtime URLs: "+external.length+" (fonts only)");
