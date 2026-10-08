import{topics}from"./data/topics.js";
export const topicName=id=>topics.find(t=>t.id===id)?.title||"عمومی";
export const pct=(a,b)=>b?Math.round(a/b*100):0;
export const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const ar=s=>'<span class="arabic" lang="ar" dir="rtl">'+esc(s)+"</span>";
export const todayKey=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};