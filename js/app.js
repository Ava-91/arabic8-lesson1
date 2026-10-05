import{topics,lesson,questions}from"./data.js";
import{loadProgress,saveProgress,resetProgress}from"./storage.js";

let state={progress:loadProgress(),quiz:null};
const app=document.querySelector("#app");
const sidebar=document.querySelector("#sidebar");
const menu=document.querySelector("#menuButton");
const toast=document.querySelector("#toast");

const topicName=id=>topics.find(t=>t.id===id)?.title||"عمومی";
const pct=(a,b)=>b?Math.round(a/b*100):0;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ar=s=>`<span class="arabic" lang="ar" dir="rtl">${esc(s)}</span>`;

function go(route){
  location.hash=route;
  closeMenu();
  window.scrollTo({top:0,behavior:"smooth"});
}

function closeMenu(){
  sidebar.classList.remove("open");
  menu.setAttribute("aria-expanded","false");
}

function persist(mutator){
  mutator(state.progress);
  const ok=saveProgress(state.progress);
  if(!ok)showToast("ذخیره پیشرفت در این مرورگر ممکن نشد.");
}

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}

function header(title,description=""){
  return `<div class="section-head"><div><div class="eyebrow">عربی ۸ • درس اول</div><h2>${title}</h2>${description?`<p>${description}</p>`:""}</div></div>`;
}

function home(){
  const p=state.progress,c=p.completedTopics.length,n=topics.length;
  const hasDiagnostic=Boolean(p.diagnostic);
  const last=p.examAttempts.at(-1);
  const next=hasDiagnostic?"learn":"diagnostic";
  return `
  <section class="hero">
    <div class="eyebrow">ابزار تعاملی یادگیری</div>
    <h1>عربی ۸</h1>
    ${ar("اَلدَّرْسُ الأَوَّلُ • مُراجَعَةُ دُروسِ الصَّفِّ السّابِعِ")}
    <p>${lesson.intro}</p>
    <div class="actions">
      <button class="btn btn-primary" data-a="go" data-r="${next}">${hasDiagnostic?"ادامه یادگیری":"شروع یادگیری"}</button>
      <button class="btn btn-secondary" data-a="go" data-r="learn">مرور آموزش</button>
    </div>
  </section>
  <section class="card progress-card">
    <div class="kicker"><span>پیشرفت آموزش</span><strong>${pct(c,n)}%</strong></div>
    <div class="progress" aria-label="پیشرفت آموزش"><span style="width:${pct(c,n)}%"></span></div>
    <p>${c} از ${n} موضوع تکمیل شده است.</p>
    ${last?`<div class="mini-result">آخرین آزمون: <strong>${last.correct}/${last.total}</strong></div>`:""}
  </section>
  <div class="section-head"><h2>مسیر پیشنهادی</h2></div>
  <section class="grid grid-3">
    <article class="card"><div class="card-icon">①</div><h3>اول تشخیص بده</h3><p>۱۰ سؤال بدون نمره برای پیدا کردن بخش‌های ضعیف‌تر.</p><button class="btn btn-secondary" data-a="go" data-r="diagnostic">${hasDiagnostic?"اجرای دوباره":"شروع"} مرور اولیه</button></article>
    <article class="card"><div class="card-icon">②</div><h3>بعد یاد بگیر</h3><p>هر موضوع را کوتاه بخوان و بلافاصله همان موضوع را تمرین کن.</p><button class="btn btn-secondary" data-a="go" data-r="learn">رفتن به آموزش</button></article>
    <article class="card"><div class="card-icon">③</div><h3>آخر خودت را بسنج</h3><p>آزمون نهایی، نتیجه و اشتباهاتت را یک‌جا نشان می‌دهد.</p><button class="btn btn-secondary" data-a="go" data-r="exam">آزمون نهایی</button></article>
  </section>
  `;
}

function diagnostic(){
  if(state.progress.diagnostic){
    const d=state.progress.diagnostic;
    return result("نتیجه مرور اولیه",d.correct,d.total,"این آزمون نمره مدرسه‌ای ندارد.",`
      ${topicBreakdown(d.byTopic||{})}
      <div class="actions" style="justify-content:center">
        <button class="btn btn-primary" data-a="quiz" data-mode="diagnostic">دوباره انجام بده</button>
        <button class="btn btn-secondary" data-a="go" data-r="learn">رفتن به آموزش</button>
      </div>`);
  }
  return quizIntro("مرور اولیه","۱۰ سؤال کوتاه برای پیدا کردن بخش‌هایی که بهتر است دوباره مرور شوند.",10,"diagnostic");
}

function quizIntro(title,description,count,mode){
  return `
  <section class="hero">
    <div class="eyebrow">ارزیابی بدون نمره</div><h1>${title}</h1><p>${description}</p>
    <section class="card intro-card">
      <div class="stat">${count}</div><strong>سؤال</strong>
      <p>بعد از هر پاسخ، دلیل درست یا غلط بودن را می‌بینی. می‌توانی در پایان اشتباهاتت را مرور کنی.</p>
      <button class="btn btn-primary" data-a="quiz" data-mode="${mode}">شروع</button>
    </section>
  </section>`;
}

function learn(){
  return `${header("آموزش","هر موضوع را کوتاه بخوان و بعد همان موضوع را تمرین کن.")}
  <section class="grid grid-2">
    ${topics.map((t,i)=>`
      <article class="card topic-card">
        <div class="topic-top"><div class="card-icon">${t.icon}</div><span class="topic-number">۰${i+1}</span></div>
        <div class="kicker"><span>موضوع ${i+1}</span>${state.progress.completedTopics.includes(t.id)?'<span class="complete">✓ تکمیل</span>':""}</div>
        <h3>${t.title}</h3><p>${t.description}</p>
        <div class="actions"><button class="btn btn-secondary" data-a="topic" data-id="${t.id}">باز کردن</button></div>
      </article>`).join("")}
  </section>`;
}

function topic(id){
  const t=topics.find(x=>x.id===id);
  if(!t)return `${header("موضوع پیدا نشد")}<div class="empty">این بخش وجود ندارد.</div>`;
  let body="";
  if(id==="reading")body=lesson.textPairs.map(x=>`<div class="example">${ar(x.ar)}<p>${x.fa}</p></div>`).join("")+`<div class="tip"><strong>نکتهٔ ترجمه</strong><p>اول فعل و ساختار جمله را پیدا کن، بعد معنی واژه‌ها را کنار هم بگذار؛ ترجمهٔ کلمه‌به‌کلمه همیشه بهترین راه نیست.</p></div>`;
  if(id==="demonstratives")body=table(["اسم اشاره","کاربرد"],lesson.demonstratives);
  if(id==="number")body=`<div class="grid grid-2">${lesson.numbers.map((x,i)=>`<div class="card"><span class="stat small-stat">${i+1}</span>${ar(x)}</div>`).join("")}</div>`;
  if(id==="pronouns")body=table(["ضمیر","معنی"],lesson.pronouns);
  if(id==="past")body=`<div class="tip"><strong>روش تشخیص</strong><p>به ضمیر و پایان فعل دقت کن. در فعل ماضی، پایان‌هایی مثل «ـتُ»، «ـنا»، «ـوا» اطلاعات مهمی دربارهٔ فاعل می‌دهند.</p></div>`+table(["فعل","معنی"],lesson.past);
  if(id==="colors")body=`<div class="grid grid-2">${lesson.colors.map(x=>`<div class="card">${ar(x[0])}<p>${x[1]}</p></div>`).join("")}</div>`;
  if(id==="days")body=`<div class="grid grid-2">${lesson.days.map((x,i)=>`<div class="card"><span class="muted">روز ${i+1}</span>${ar(x)}</div>`).join("")}</div>`;
  if(id==="seasons")body=`<div class="grid grid-2">${lesson.seasons.map(x=>`<div class="card">${ar(x[0])}<p>${x[1]}</p></div>`).join("")}</div>`;
  if(id==="synonyms")body=`<div class="grid grid-2">${lesson.pairs.map(x=>`<div class="card">${ar(x[0]+" ↔ "+x[1])}<p>${x[2]}</p></div>`).join("")}</div>`;
  return `<section class="lesson">${header(t.title,t.description)}${body}<div class="topic-actions"><button class="btn btn-primary" data-a="quiz-topic" data-id="${id}">تمرین این موضوع</button><button class="btn btn-secondary" data-a="go" data-r="learn">همهٔ موضوع‌ها</button></div></section>`;
}

function table(head,rows){
  return `<div class="table-wrap"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>`<td class="${i===0?"arabic":""}" lang="${i===0?"ar":"fa"}" dir="${i===0?"rtl":"rtl"}">${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function practice(){
  return `${header("تمرین","۱۰ سؤال ترکیبی از موضوع‌های درس اول با بازخورد فوری.")}
  <section class="card"><h3>یادگیری با پاسخ‌دادن</h3><p>اگر اشتباه کنی، فقط جواب درست را نمی‌بینی؛ دلیلش را هم می‌خوانی.</p><button class="btn btn-primary" data-a="quiz" data-mode="practice">شروع تمرین</button></section>`;
}

function exam(){
  const last=state.progress.examAttempts.at(-1);
  return `${header("آزمون نهایی","۲۰ سؤال ترکیبی برای سنجش آمادگی.")}
  <section class="card"><h3>قبل از شروع</h3><ul><li>۲۰ سؤال</li><li>هر پاسخ درست یک امتیاز دارد.</li><li>پاسخ‌های اشتباه برای مرور ذخیره می‌شوند.</li><li>بعد از پایان، نتیجه و وضعیت موضوع‌ها را می‌بینی.</li></ul><button class="btn btn-primary" data-a="quiz" data-mode="exam">شروع آزمون نهایی</button></section>
  ${last?result("آخرین نتیجه",last.correct,last.total,"",`<button class="btn btn-secondary" data-a="quiz" data-mode="exam">دوباره امتحان بده</button>`):""}`;
}

function progress(){
  const p=state.progress,last=p.examAttempts.at(-1);
  return `${header("پیشرفت من","نتایج این دستگاه در مرورگر ذخیره می‌شوند؛ اطلاعات به حساب کاربری یا سرور ارسال نمی‌شود.")}
  <section class="grid grid-3">
    <div class="card"><div class="muted">موضوع‌های تکمیل‌شده</div><div class="stat">${p.completedTopics.length}/${topics.length}</div></div>
    <div class="card"><div class="muted">آخرین آزمون</div><div class="stat">${last?last.correct+"/"+last.total:"—"}</div></div>
    <div class="card"><div class="muted">اشتباه‌های ذخیره‌شده</div><div class="stat">${p.mistakes.length}</div></div>
  </section>
  <div class="section-head"><h2>وضعیت موضوع‌ها</h2></div>
  <section class="grid grid-2">${topics.map(t=>{const s=p.topicScores[t.id];return`<div class="card"><div class="kicker"><strong>${t.title}</strong><span>${s?s.percent+"%":"شروع نشده"}</span></div><div class="progress"><span style="width:${s?.percent||0}%"></span></div>${s?`<small class="muted">${s.correct} پاسخ درست از ${s.total}</small>`:""}</div>`}).join("")}</section>
  <div class="actions"><button class="btn btn-secondary" data-a="go" data-r="mistakes">مرور اشتباهات (${p.mistakes.length})</button><button class="btn btn-danger" data-a="reset">پاک کردن پیشرفت</button></div>`;
}

function about(){
  return `${header("درباره پروژه")}
  <section class="card">
    <h3>هدف</h3><p>این برنامه برای کمک به دانش‌آموزان پایه هشتم در مرور و یادگیری درس اول عربی طراحی شده است؛ آموزش‌ها به فارسی توضیح داده می‌شوند و تمرین‌ها بازخورد فوری دارند.</p>
    <h3>فناوری</h3><p>HTML، CSS و JavaScript خالص؛ بدون حساب کاربری، backend یا database. پیشرفت فقط در localStorage همین مرورگر ذخیره می‌شود.</p>
    <h3>منبع</h3><p>مبنای آموزشی کتاب «عربی، زبان قرآن ۲» پایه هشتم، چاپ ۱۴۰۵ و ساختار درس اول آن است. محتوای نهایی باید با نسخهٔ کتاب و تدریس مدرسه تطبیق داده شود.</p>
  </section>`;
}

function result(title,correct,total,note,extra=""){
  const score=pct(correct,total);
  return `<section class="card result"><div class="eyebrow">${title}</div><div class="score">${correct}/${total}</div><h2>${score>=90?"عالی!":score>=70?"خیلی خوب!":score>=50?"خوب، ولی جای مرور دارد":"وقت یک مرور دوباره است"}</h2><p>${note}</p><div class="progress"><span style="width:${score}%"></span></div>${extra}</section>`;
}

function topicBreakdown(byTopic){
  const entries=Object.entries(byTopic).sort((a,b)=>pct(a[1].correct,a[1].total)-pct(b[1].correct,b[1].total));
  const rows=entries.map(([id,s])=>{
    const score=pct(s.correct,s.total);
    const cls=score<70?"weak":score===100?"strong":"";
    return `<div class="breakdown-row ${cls}"><span>${topicName(id)}</span><strong>${s.correct}/${s.total} • ${score}%</strong></div>`;
  }).join("");
  const weak=entries.filter(([,s])=>pct(s.correct,s.total)<70);
  const advice=weak.length?`<p class="recommendation">پیشنهاد مرور: <strong>${weak.slice(0,3).map(([id])=>topicName(id)).join("، ")}</strong></p>`:"<p class=\"recommendation good\">هیچ موضوعی زیر ۷۰٪ نیست؛ مرور کلی بعدی کافی است.</p>";
  return rows?`<div class="breakdown"><h3>نقاط نیازمند مرور</h3>${advice}${rows}</div>`:"";
}

function selectQuestions(mode,topic=null){
  const pool=questions.filter(q=>!topic||q.topic===topic);
  const count=mode==="exam"?Math.min(20,pool.length):mode==="diagnostic"?Math.min(10,pool.length):Math.min(10,pool.length);
  if(topic)return shuffle(pool).slice(0,count);
  if(mode==="diagnostic"){
    const groups=pool.reduce((acc,q)=>{(acc[q.topic]??=[]).push(q);return acc},{});
    const selected=[];
    const entries=shuffle(Object.entries(groups));
    while(selected.length<count&&entries.length){
      for(const [,items] of entries){
        if(selected.length>=count)break;
        const remaining=items.filter(q=>!selected.includes(q));
        if(remaining.length)selected.push(remaining[Math.floor(Math.random()*remaining.length)]);
      }
    }
    return selected;
  }
  return shuffle(pool).slice(0,count);
}

function startQuiz(mode,topic=null){
  const selected=selectQuestions(mode,topic);
  if(!selected.length){showToast("برای این موضوع هنوز سؤال ثبت نشده است.");return}
  state.quiz={mode,topic,questions:selected,index:0,correct:0,answers:[]};
  drawQuiz();
}

function drawQuiz(){
  const z=state.quiz;
  if(!z)return;
  const q=z.questions[z.index];
  if(!q)return finishQuiz();
  const progress=pct(z.index+1,z.questions.length);
  app.innerHTML=`<section class="quiz-shell">
    <div class="quiz-top"><button class="btn btn-secondary btn-small" data-a="quit-quiz">خروج</button><div class="question-meta"><span>${z.mode==="exam"?"آزمون نهایی":z.mode==="diagnostic"?"مرور اولیه":"تمرین"}</span><span>سؤال ${z.index+1} از ${z.questions.length}</span></div></div>
    <div class="progress" aria-label="پیشرفت آزمون"><span style="width:${progress}%"></span></div>
    <article class="question-card" aria-live="polite">
      <div class="eyebrow">${topicName(q.topic)}</div>
      <h2>${esc(q.q)}</h2>
      <div class="options" role="group" aria-label="گزینه‌های پاسخ">${q.options.map((o,i)=>`<button class="option" data-a="answer" data-i="${i}">${esc(o)}</button>`).join("")}</div>
      <div id="feedback"></div>
    </article>
  </section>`;
  app.focus({preventScroll:true});
  window.scrollTo({top:0,behavior:"smooth"});
}

function answer(index){
  const z=state.quiz,q=z.questions[z.index],ok=index===q.answer;
  const options=[...document.querySelectorAll(".option")];
  options.forEach(b=>b.disabled=true);
  if(options[index])options[index].classList.add(ok?"correct":"wrong");
  if(options[q.answer])options[q.answer].classList.add("correct");
  if(ok)z.correct++;
  z.answers.push({id:q.id,topic:q.topic,correct:ok});
  document.querySelector("#feedback").innerHTML=`<div class="feedback ${ok?"correct":"wrong"}"><strong>${ok?"✓ پاسخ درست":"✗ پاسخ درست نیست"}</strong><p>${esc(q.explanation)}</p><div class="actions"><button class="btn btn-primary" data-a="next">${z.index===z.questions.length-1?"دیدن نتیجه":"سؤال بعدی"}</button></div></div>`;
}

function finishQuiz(){
  const z=state.quiz;
  if(!z)return;
  const by={};
  z.answers.forEach(a=>{
    by[a.topic]??={correct:0,total:0};
    by[a.topic].total++;
    if(a.correct)by[a.topic].correct++;
  });
  if(z.mode==="diagnostic"){
    persist(p=>p.diagnostic={correct:z.correct,total:z.questions.length,byTopic:by,date:new Date().toISOString()});
  }else{
    persist(p=>{
      if(z.mode==="exam")p.examAttempts.push({correct:z.correct,total:z.questions.length,date:new Date().toISOString(),byTopic:by});
      z.answers.forEach(a=>{
        if(!a.correct&&!p.mistakes.includes(a.id))p.mistakes.push(a.id);
        if(a.correct)p.mistakes=p.mistakes.filter(id=>id!==a.id);
      });
      Object.entries(by).forEach(([id,s])=>{
        const previous=p.topicScores[id]||{correct:0,total:0};
        const total=previous.total+s.total;
        const correct=previous.correct+s.correct;
        p.topicScores[id]={correct,total,percent:pct(correct,total)};
        if(z.topic&&!p.completedTopics.includes(id)&&s.correct===s.total&&s.total>=2)p.completedTopics.push(id);
      });
    });
  }
  const title=z.mode==="diagnostic"?"نتیجه مرور اولیه":z.mode==="exam"?"نتیجه آزمون نهایی":"نتیجه تمرین";
  const note=z.mode==="diagnostic"?"از این نتیجه برای انتخاب موضوع‌های نیازمند مرور استفاده کن.":"پاسخ‌های اشتباه برای مرور بعدی ذخیره شدند.";
  app.innerHTML=result(title,z.correct,z.questions.length,note,`${topicBreakdown(by)}<div class="actions" style="justify-content:center"><button class="btn btn-primary" data-a="go" data-r="mistakes">مرور اشتباهات</button><button class="btn btn-secondary" data-a="go" data-r="home">خانه</button></div>`);
  state.quiz=null;
  window.scrollTo({top:0,behavior:"smooth"});
}

function mistakes(){
  const qs=questions.filter(q=>state.progress.mistakes.includes(q.id));
  if(!qs.length)return `${header("اشتباهات من")}<div class="empty"><strong>اینجا خالی است. 🎉</strong><p>فعلاً اشتباهی برای مرور ذخیره نشده.</p><button class="btn btn-secondary" data-a="go" data-r="learn">رفتن به آموزش</button></div>`;
  return `${header("اشتباهات من","سؤال‌هایی که قبلاً اشتباه پاسخ داده‌ای و هنوز دوباره درست حلشان نکرده‌ای.")}
    <section class="card"><div class="stat">${qs.length}</div><p>سؤال برای مرور داری.</p><button class="btn btn-primary" data-a="mistake-quiz">شروع مرور</button></section>`;
}

function render(){
  const raw=(location.hash||"#home").slice(1);
  const parts=raw.split("/");
  const route=parts[0];
  const views={home,diagnostic,learn,practice,exam,progress,about,mistakes};
  app.innerHTML=route==="topic"&&parts[1]?topic(parts[1]):views[route]?.()||home;
  document.querySelectorAll("[data-route]").forEach(a=>{
    const active=route==="topic"?a.dataset.route==="learn":a.dataset.route===route;
    a.classList.toggle("active",active);
  });
  app.focus({preventScroll:true});
}

document.addEventListener("click",e=>{
  const x=e.target.closest("[data-a]");
  if(!x)return;
  const a=x.dataset.a;
  if(a==="go")go(x.dataset.r);
  if(a==="quiz")startQuiz(x.dataset.mode);
  if(a==="quiz-topic")startQuiz("practice",x.dataset.id);
  if(a==="answer")answer(Number(x.dataset.i));
  if(x.matches("[data-route]"))closeMenu();
  if(a==="next"){state.quiz.index++;drawQuiz()}
  if(a==="topic")go("topic/"+x.dataset.id);
  if(a==="quit-quiz"){
    if(confirm("آزمون فعلی متوقف شود؟ پاسخ‌های این دور ذخیره نمی‌شوند.")){state.quiz=null;go("home")}
  }
  if(a==="reset"&&confirm("همه پیشرفت این مرورگر پاک شود؟")){
    state.progress=resetProgress();
    showToast("پیشرفت پاک شد");
    render();
  }
  if(a==="mistake-quiz"){
    const qs=questions.filter(q=>state.progress.mistakes.includes(q.id));
    state.quiz={mode:"practice",topic:null,questions:shuffle(qs),index:0,correct:0,answers:[]};
    drawQuiz();
  }
});

document.addEventListener("click",e=>{
  if(!sidebar.classList.contains("open"))return;
  if(e.target.closest("#menuButton")||e.target.closest("#sidebar"))return;
  closeMenu();
});

menu.addEventListener("click",()=>{
  const open=sidebar.classList.toggle("open");
  menu.setAttribute("aria-expanded",String(open));
});

window.addEventListener("hashchange",render);
render();
