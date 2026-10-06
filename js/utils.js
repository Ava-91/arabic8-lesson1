import{topics}from"./data/topics.js";

export const topicName=id=>topics.find(t=>t.id===id)?.title||"عمومی";
export const pct=(a,b)=>b?Math.round(a/b*100):0;
export const shuffle=a=>[...a].sort(()=>Math.random()-.5);
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const ar=s=>'<span class="arabic" lang="ar" dir="rtl">'+esc(s)+"</span>";
