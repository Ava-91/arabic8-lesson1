import{topics,lesson,questions}from"./data.js";
import{loadProgress,saveProgress,resetProgress}from"./storage.js";
let state={progress:loadProgress(),quiz:null,dialogAction:null};
const app=document.querySelector("#app"),sidebar=document.querySelector("#sidebar"),menu=document.querySelector("#menuButton"),toast=document.querySelector("#toast"),dialog=document.querySelector("#dialog");
const topicName=id=>topics.find(t=>t.id===id)?.title||"عمومی";
const pct=(a,b)=>b?Math.round(a/b*100):0;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ar=s=>'<span class="arabic" lang="ar" dir="rtl">'+esc(s)+"</span>";
function go(route){location.hash=route;closeMenu();window.scrollTo({top:0,behavior:"smooth"})}
function closeMenu(){sidebar.classList.remove("open");menu.setAttribute("aria-expanded","false")}
function persist(fn){fn(state.progress);if(!saveProgress(state.progress))showToast("ذخیرهٔ پیشرفت در این مرورگر ممکن نشد.")}
function showToast(message){toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200)}
function header(title,desc=""){return '<div class="section-head"><div><div class="eyebrow">عربی ۸ · درس اول</div><h2>'+title+"</h2>"+(desc?"<p>"+desc+"</p>":"")+"</div></div>"}
function recent(id){return state.progress.topicRecent?.[id]||[]}
function recentScore(id){const a=recent(id);return a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length*100):null}
function mastery(id){const r=recentScore(id),n=recent(id).length;if(r===null)return"شروع نشده";if(r>=80&&n>=5)return"مسلط";if(r<70)return"نیاز به مرور";return"در حال یادگیری"}
function statusClass(s){return s==="مسلط"?"mastered":s==="نیاز به مرور"?"review":""}

function home(){
 const p=state.progress,mastered=topics.filter(t=>mastery(t.id)==="مسلط").length,last=p.examAttempts.at(-1),has=Boolean(p.diagnostic);
 return '<section class="hero"><div class="eyebrow">درس اول · مرور پایه هفتم</div><h1>عربی ۸</h1>'+ar(lesson.title)+'<p class="intro">'+lesson.intro+'</p><div class="actions"><button class="btn btn-primary" data-a="go" data-r="'+(has?"learn":"diagnostic")+'">'+(has?"ادامهٔ یادگیری":"شروع مرور")+'</button><button class="btn btn-secondary" data-a="go" data-r="learn">دیدن درس‌ها</button></div></section>'+
 '<section class="progress-strip"><span class="number">'+mastered+'</span><div><strong>موضوع مسلط</strong><p class="quiet">از '+topics.length+" موضوع</p></div><div class="progress"><span style="width:"+pct(mastered,topics.length)+'%"></span></div>'+(last?'<span class="quiet">آزمون '+last.correct+"/"+last.total+"</span>":"")+"</section>"+
 '<div class="section-head"><h2>چهار قدم ساده</h2><p>اول ببین چه بلدی، بعد بخوان و تمرین کن، و آخر خودت را بسنج.</p></div><section class="lesson-path">'+
 path("۱","مرور اولیه","۱۰ سؤال کوتاه؛ بدون نمرهٔ مدرسه‌ای.","diagnostic",has?"دوباره":"شروع")+
 path("۲","درس‌ها","متن، اسم اشاره، ماضی، عددها، رنگ‌ها و بقیهٔ نکته‌ها.","learn","باز کردن")+
 path("۳","تمرین","پاسخ بده و همان لحظه دلیل جواب را ببین.","practice","تمرین")+
 path("۴","آزمون نهایی","۲۰ سؤال ترکیبی برای سنجش آمادگی.","exam","آزمون")+"</section>";
}
function path(n,title,desc,route,label){return '<div class="path-step"><span class="path-number">'+n+'</span><div><h3>'+title+'</h3><p>'+desc+"</p></div><button class="btn btn-secondary" data-a="go" data-r=""+route+'">'+label+"</button></div>"}

function diagnostic(){if(state.progress.diagnostic){const d=state.progress.diagnostic;return result("مرور اولیه",d.correct,d.total,"این نتیجه فقط برای پیدا کردن نقطه‌های نیازمند مرور است.",topicBreakdown(d.byTopic||{})+'<div class="actions"><button class="btn btn-primary" data-a="quiz" data-mode="diagnostic">دوباره انجام بده</button><button class="btn btn-secondary" data-a="go" data-r="learn">رفتن به درس‌ها</button></div>')}return quizIntro("مرور اولیه","۱۰ سؤال کوتاه برای اینکه بفهمی کدام بخش‌ها را بهتر است دوباره بخوانی.",10,"diagnostic")}
function quizIntro(title,desc,count,mode){return '<section class="hero"><div class="eyebrow">بدون نمرهٔ مدرسه‌ای</div><h1>'+title+"</h1><p>"+desc+'</p><div class="intro"><strong>'+count+' سؤال</strong><p>بعد از هر پاسخ، دلیل جواب را می‌بینی. این بخش برای یادگیری است، نه قضاوت.</p><button class="btn btn-primary" data-a="quiz" data-mode="'+mode+'">شروع</button></div></section>'}

function learn(){return header("درس‌ها","هر بخش را باز کن، بخوان و بعد همان موضوع را تمرین کن.")+'<section class="topic-list">'+topics.map((t,i)=>{const s=mastery(t.id);return '<article class="topic-row"><span class="topic-index">۰'+(i+1)+'</span><div><h3>'+t.title+'</h3><p>'+t.description+'</p></div><div><span class="topic-status '+statusClass(s)+'">'+s+'</span><br><button class="btn btn-secondary btn-small" data-a="topic" data-id="'+t.id+'">خواندن</button></div></article>'}).join("")+"</section>"}

function topic(id){
 const t=topics.find(x=>x.id===id);if(!t)return empty("این موضوع پیدا نشد.");let body="";
 if(id==="reading")body='<div class="reading-list">'+lesson.textPairs.map(x=>'<div class="reading-item">'+ar(x.ar)+"<p>"+x.fa+"</p></div>").join("")+'</div><div class="tip"><strong>نکتهٔ ترجمه</strong><p>اول ساختار جمله را پیدا کن، بعد معنی واژه‌ها را کنار هم بگذار.</p></div>';
 if(id==="demonstratives")body=table(["اسم اشاره","کاربرد"],lesson.demonstratives);
 if(id==="number")body='<div class="word-grid">'+lesson.numbers.map((x,i)=>'<div class="word"><span class="quiet">عدد '+(i+1)+"</span>"+ar(x)+"</div>").join("")+"</div>";
 if(id==="pronouns")body=table(["ضمیر","معنی"],lesson.pronouns);
 if(id==="past")body='<div class="tip"><strong>روش تشخیص</strong><p>به ضمیر و پایان فعل دقت کن؛ پایان‌هایی مثل «ـتُ»، «ـنا» و «ـوا» دربارهٔ فاعل اطلاعات می‌دهند.</p></div>'+table(["فعل","معنی"],lesson.past);
 if(id==="colors")body=words(lesson.colors);
 if(id==="days")body='<div class="word-grid">'+lesson.days.map((x,i)=>'<div class="word"><span class="quiet">روز '+(i+1)+"</span>"+ar(x)+"</div>").join("")+"</div>";
 if(id==="seasons")body=words(lesson.seasons);
 if(id==="vocabulary")body=words(lesson.vocabulary);
 if(id==="classification")body=table(["واژه","دسته","معنی"],lesson.classification);
 if(id==="synonyms")body='<div class="word-grid">'+lesson.synonymPairs.map(x=>'<div class="word">'+ar(x[0]+" = "+x[1])+"<p>"+x[2]+" · "+x[3]+"</p></div>").join("")+lesson.antonymPairs.map(x=>'<div class="word">'+ar(x[0]+" ↔ "+x[1])+"<p>متضاد</p></div>").join("")+"</div>";
 if(id==="visual-practice")body='<div class="visual-grid">'+lesson.visualExercises.map((x,i)=>'<article class="visual-card"><img src="'+x[0]+'" alt="'+esc(x[1])+'" loading="lazy" decoding="async"><div class="visual-copy"><span class="quiet">تمرین تصویری '+(i+1)+"</span>"+ar(x[1])+ar(x[2])+"<p>"+x[3]+"</p></div></article>").join("")+'</div><div class="tip"><strong>تمرین بازسازی‌شده</strong><p>این تصاویر برای تمرین مفهوم سؤال‌های تصویری بازسازی شده‌اند و کپی دقیق تصویرهای کتاب نیستند.</p></div>';
 if(id==="odd-one-out")body='<div class="word-grid">'+lesson.oddOneOut.map((x,i)=>'<div class="word"><span class="quiet">ردیف '+(i+1)+"</span>"+ar(x.slice(0,4).join(" · "))+"<p>واژه‌ای را پیدا کن که با بقیه هماهنگ نیست.</p></div>").join("")+"</div>";
 return '<section class="lesson">'+header(t.title,t.description)+body+'<div class="topic-actions actions"><button class="btn btn-primary" data-a="quiz-topic" data-id="'+id+'">تمرین این موضوع</button><button class="btn btn-secondary" data-a="go" data-r="learn">بازگشت به درس‌ها</button></div></section>';
}
function words(rows){return '<div class="word-grid">'+rows.map(x=>'<div class="word">'+ar(x[0])+"<p>"+x[1]+"</p></div>").join("")+"</div>"}
function table(head,rows){return '<div class="table-wrap"><table><thead><tr>'+head.map(h=>"<th>"+h+"</th>").join("")+"</tr></thead><tbody>"+rows.map(r=>"<tr>"+r.map((v,i)=>'<td class="'+(i===0?"arabic":"")+'" lang="'+(i===0?"ar":"fa")+'">'+esc(v)+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>"}

function practice(){return header("تمرین","۱۰ سؤال ترکیبی؛ اشتباه کردن اینجا بخشی از یادگیری است.")+'<div class="intro"><h3>اول جواب بده، بعد دلیل را بخوان.</h3><p>پاسخ‌های غلط برای مرور بعدی نگه داشته می‌شوند.</p><button class="btn btn-primary" data-a="quiz" data-mode="practice">شروع تمرین</button></div>'}
function exam(){const last=state.progress.examAttempts.at(-1);return header("آزمون نهایی","۲۰ سؤال ترکیبی برای سنجش آمادگی.")+'<div class="intro"><h3>حالا بدون کمک خودت را بسنج.</h3><p>بعد از پایان، موضوع‌های قوی و ضعیف را می‌بینی.</p><div class="actions"><button class="btn btn-primary" data-a="quiz" data-mode="exam">شروع آزمون</button>'+(last?'<button class="btn btn-secondary" data-a="go" data-r="progress">دیدن نتیجهٔ آخر</button>':"")+"</div></div>"}

function progress(){
 const p=state.progress,last=p.examAttempts.at(-1),mastered=topics.filter(t=>mastery(t.id)==="مسلط"),review=topics.filter(t=>mastery(t.id)==="نیاز به مرور");
 return header("دفتر پیشرفت","به جای نمودارهای شلوغ، اینجا می‌بینی چه چیزهایی را یاد گرفته‌ای و چه چیزهایی ارزش مرور دارند.")+
 '<div class="stats-line"><div><span class="stat">'+mastered.length+'</span><span class="stat-label">مسلط</span></div><div><span class="stat">'+review.length+'</span><span class="stat-label">نیازمند مرور</span></div><div><span class="stat">'+p.mistakes.length+'</span><span class="stat-label">اشتباه ذخیره‌شده</span></div><div><span class="stat">'+(last?last.correct+"/"+last.total:"—")+'</span><span class="stat-label">آخرین آزمون</span></div></div>'+
 (review.length?'<div class="section-head"><h2>اول این‌ها را مرور کن</h2></div><div class="word-grid">'+review.slice(0,4).map(t=>'<div class="word"><strong>'+t.title+'</strong><p>آخرین پاسخ‌ها نشان می‌دهند که این بخش هنوز جای تمرین دارد.</p><button class="btn btn-secondary btn-small" data-a="topic" data-id="'+t.id+'">مرور</button></div>').join("")+"</div>":'<div class="tip"><strong>فعلاً موضوعی زیر ۷۰٪ نیست.</strong><p>یک مرور کوتاه و بعد آزمون نهایی کافی است.</p></div>')+
 '<div class="section-head"><h2>وضعیت همهٔ موضوع‌ها</h2></div><div class="progress-list">'+topics.map(t=>{const s=mastery(t.id),r=recentScore(t.id);return '<div class="progress-row"><strong>'+t.title+'</strong><div class="progress"><span style="width:'+(r||0)+'%"></span></div><small>'+s+(r!==null?" · "+r+"٪":"")+"</small></div>"}).join("")+"</div>"+
 '<div class="actions"><button class="btn btn-secondary" data-a="go" data-r="mistakes">مرور اشتباهات ('+p.mistakes.length+')</button><button class="btn btn-danger" data-a="reset">شروع دوباره</button></div>";
}
function mistakes(){const qs=questions.filter(q=>state.progress.mistakes.includes(q.id));if(!qs.length)return header("اشتباهات من")+'<div class="empty"><strong>فعلاً اشتباهی برای مرور نیست.</strong><p>این صفحه وقتی چیزی را اشتباه جواب بدهی، پر می‌شود.</p><button class="btn btn-secondary" data-a="go" data-r="learn">رفتن به درس‌ها</button></div>';return header("اشتباهات من","سؤال‌هایی که هنوز دوباره درست پاسخ نداده‌ای.")+'<div class="intro"><div class="stat">'+qs.length+'</div><p>سؤال برای مرور داری.</p><button class="btn btn-primary" data-a="mistake-quiz">شروع مرور</button></div>'}
function empty(text){return '<div class="empty">'+text+"</div>"}

function result(title,correct,total,note,extra=""){const score=pct(correct,total);return '<section class="result"><div class="eyebrow">'+title+'</div><div class="score">'+correct+"/"+total+'</div><h2>'+ (score>=90?"خیلی خوب!":score>=70?"خوب پیش رفتی.":score>=50?"چند بخش را دوباره بخوان.":"وقت یک مرور دوباره است.")+"</h2><p>"+note+'</p><div class="progress"><span style="width:'+score+'%"></span></div>'+extra+"</section>"}
function topicBreakdown(by){const entries=Object.entries(by).sort((a,b)=>pct(a[1].correct,a[1].total)-pct(b[1].correct,b[1].total));if(!entries.length)return"";const rows=entries.map(([id,s])=>{const n=pct(s.correct,s.total);return '<div class="breakdown-row '+(n<70?"weak":n===100?"strong":"")+'"><span>'+topicName(id)+"</span><strong>"+s.correct+"/"+s.total+" · "+n+"٪</strong></div>"}).join("");const weak=entries.filter(([,s])=>pct(s.correct,s.total)<70);return '<div class="breakdown"><h3>نتیجهٔ هر بخش</h3>'+(weak.length?'<p class="recommendation">پیشنهاد مرور: <strong>'+weak.slice(0,3).map(([id])=>topicName(id)).join("، ")+"</strong></p>":'<p class="recommendation good">هیچ بخش اینجا زیر ۷۰٪ نیست.</p>')+rows+"</div>"}

function selectQuestions(mode,topic=null){
 const pool=questions.filter(q=>!topic||q.topic===topic),count=topic?Math.min(10,pool.length):mode==="exam"?Math.min(20,pool.length):Math.min(10,pool.length);
 if(topic)return shuffle(pool).slice(0,count);
 const groups={};pool.forEach(q=>(groups[q.topic]??=[]).push(q));
 const selected=[];for(const [,items] of shuffle(Object.entries(groups))){if(selected.length>=count)break;selected.push(items[Math.floor(Math.random()*items.length)])}
 return selected.concat(shuffle(pool.filter(q=>!selected.includes(q)))).slice(0,count);
}
function startQuiz(mode,topic=null){const selected=selectQuestions(mode,topic);if(!selected.length){showToast("برای این موضوع هنوز سؤال ثبت نشده است.");return}state.quiz={mode,topic,questions:selected,index:0,correct:0,answers:[]};drawQuiz()}
function drawQuiz(){const z=state.quiz;if(!z)return;const q=z.questions[z.index];if(!q)return finishQuiz();app.innerHTML='<section class="quiz-shell"><div class="quiz-top"><button class="btn btn-secondary" data-a="quit-quiz">خروج</button><div class="question-meta"><span>'+(z.mode==="exam"?"آزمون نهایی":z.mode==="diagnostic"?"مرور اولیه":"تمرین")+"</span><span>سؤال "+(z.index+1)+" از "+z.questions.length+'</span></div></div><div class="progress"><span style="width:'+pct(z.index+1,z.questions.length)+'%"></span></div><article class="question-card"><div class="eyebrow">'+topicName(q.topic)+"</div><h2>"+esc(q.q)+"</h2><div class="options">"+q.options.map((o,i)=>'<button class="option" data-a="answer" data-i="'+i+'">'+esc(o)+"</button>").join("")+'</div><div id="feedback"></div></article></section>';app.focus({preventScroll:true});window.scrollTo({top:0,behavior:"smooth"})}
function answer(index){const z=state.quiz,q=z.questions[z.index],ok=index===q.answer,options=[...document.querySelectorAll(".option")];options.forEach(b=>b.disabled=true);if(options[index])options[index].classList.add(ok?"correct":"wrong");if(options[q.answer])options[q.answer].classList.add("correct");if(ok)z.correct++;z.answers.push({id:q.id,topic:q.topic,correct:ok});document.querySelector("#feedback").innerHTML='<div class="feedback '+(ok?"correct":"wrong")+'"><div class="why">چرا؟</div><strong>'+(ok?"پاسخ درست است.":"پاسخ درست این نبود.")+"</strong><p>"+esc(q.explanation)+'</p><div class="actions"><button class="btn btn-primary" data-a="next">'+(z.index===z.questions.length-1?"دیدن نتیجه":"سؤال بعدی")+"</button></div></div>"}
function finishQuiz(){
 const z=state.quiz;if(!z)return;const by={};z.answers.forEach(a=>{by[a.topic]??={correct:0,total:0};by[a.topic].total++;if(a.correct)by[a.topic].correct++});
 if(z.mode==="diagnostic")persist(p=>p.diagnostic={correct:z.correct,total:z.questions.length,byTopic:by,date:new Date().toISOString()});
 else persist(p=>{
  if(z.mode==="exam")p.examAttempts.push({correct:z.correct,total:z.questions.length,date:new Date().toISOString(),byTopic:by});
  z.answers.forEach(a=>{if(!a.correct&&!p.mistakes.includes(a.id))p.mistakes.push(a.id);if(a.correct)p.mistakes=p.mistakes.filter(id=>id!==a.id);p.topicRecent[a.topic]??=[];p.topicRecent[a.topic].push(a.correct?1:0);p.topicRecent[a.topic]=p.topicRecent[a.topic].slice(-10)});
  Object.entries(by).forEach(([id,s])=>{const old=p.topicScores[id]||{correct:0,total:0};p.topicScores[id]={correct:old.correct+s.correct,total:old.total+s.total,percent:pct(old.correct+s.correct,old.total+s.total)}});
  p.completedTopics=topics.filter(t=>recentScore(t.id)>=80&&recent(t.id).length>=5).map(t=>t.id);
 });
 const title=z.mode==="diagnostic"?"نتیجهٔ مرور اولیه":z.mode==="exam"?"نتیجهٔ آزمون نهایی":"نتیجهٔ تمرین";
 app.innerHTML=result(title,z.correct,z.questions.length,z.mode==="diagnostic"?"از این نتیجه برای انتخاب درس‌های بعدی استفاده کن.":"اشتباه‌ها تا وقتی دوباره درست پاسخ ندهی در مرور می‌مانند.",topicBreakdown(by)+'<div class="actions"><button class="btn btn-primary" data-a="go" data-r="progress">دفتر پیشرفت</button><button class="btn btn-secondary" data-a="go" data-r="home">خانه</button></div>');state.quiz=null;window.scrollTo({top:0,behavior:"smooth"})
}
function openDialog(type){state.dialogAction=type;dialog.querySelector("#dialogTitle").textContent=type==="reset"?"پاک کردن پیشرفت؟":"توقف تمرین؟";dialog.querySelector("#dialogText").textContent=type==="reset"?"همهٔ پیشرفت ذخیره‌شده در این مرورگر پاک می‌شود.":"پاسخ‌های این دور ذخیره نمی‌شوند.";dialog.hidden=false;dialog.querySelector('[data-a="dialog-cancel"]').focus()}
function closeDialog(){dialog.hidden=true;state.dialogAction=null}
function render(){const raw=(location.hash||"#home").slice(1),parts=raw.split("/"),route=parts[0],views={home,diagnostic,learn,practice,exam,progress,mistakes};app.innerHTML=route==="topic"&&parts[1]?topic(parts[1]):views[route]?.()||home;document.querySelectorAll("[data-route]").forEach(a=>a.classList.toggle("active",a.dataset.route===route||(route==="topic"&&a.dataset.route==="learn")));app.focus({preventScroll:true})}
document.addEventListener("click",e=>{const x=e.target.closest("[data-a]");if(!x)return;const a=x.dataset.a;
 if(a==="go")go(x.dataset.r);else if(a==="quiz")startQuiz(x.dataset.mode);else if(a==="quiz-topic")startQuiz("practice",x.dataset.id);else if(a==="answer")answer(Number(x.dataset.i));else if(a==="topic")go("topic/"+x.dataset.id);else if(a==="next"){state.quiz.index++;drawQuiz()}else if(a==="quit-quiz")openDialog("quit");else if(a==="dialog-cancel")closeDialog();else if(a==="dialog-confirm"){const action=state.dialogAction;closeDialog();if(action==="reset"){state.progress=resetProgress();showToast("پیشرفت پاک شد");render()}else{state.quiz=null;go("home")}}else if(a==="reset")openDialog("reset");else if(a==="mistake-quiz"){const qs=questions.filter(q=>state.progress.mistakes.includes(q.id));state.quiz={mode:"practice",topic:null,questions:shuffle(qs),index:0,correct:0,answers:[]};drawQuiz()}});
document.addEventListener("click",e=>{if(sidebar.classList.contains("open")&&!e.target.closest("#menuButton")&&!e.target.closest("#sidebar"))closeMenu()});
menu.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
window.addEventListener("hashchange",render);render();