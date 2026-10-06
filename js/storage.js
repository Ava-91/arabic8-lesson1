const KEY="arabic8-lesson1-progress-v3";
const defaults=()=>({version:3,diagnostic:null,topicScores:{},topicRecent:{},completedTopics:[],examAttempts:[],mistakes:[]});
export function loadProgress(){try{const raw=localStorage.getItem(KEY);if(!raw)return defaults();const p=JSON.parse(raw);return{...defaults(),...p,version:3,topicRecent:p.topicRecent&&typeof p.topicRecent==="object"?p.topicRecent:{}}}catch{return defaults()}}
export function saveProgress(progress){try{localStorage.setItem(KEY,JSON.stringify(progress));return true}catch{return false}}
export function resetProgress(){try{localStorage.removeItem(KEY)}catch{}return defaults()}