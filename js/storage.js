const KEY="arabic8-lesson1-progress-v2";

const defaults=()=>({
  version:2,
  diagnostic:null,
  topicScores:{},
  completedTopics:[],
  examAttempts:[],
  mistakes:[]
});

export function loadProgress(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return defaults();
    const parsed=JSON.parse(raw);
    return {...defaults(),...parsed,version:2};
  }catch{
    return defaults();
  }
}

export function saveProgress(progress){
  try{
    localStorage.setItem(KEY,JSON.stringify(progress));
    return true;
  }catch{
    return false;
  }
}

export function resetProgress(){
  try{localStorage.removeItem(KEY)}catch{}
  return defaults();
}
