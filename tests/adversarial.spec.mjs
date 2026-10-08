import{test,expect}from"@playwright/test";

test("100-round adversarial interaction torture test",async({page})=>{
  page.on("dialog",d=>d.accept());
  await page.setViewportSize({width:390,height:800});
  for(let round=1;round<=100;round++){
    await page.evaluate(()=>{location.hash="#topic/colors"});
    await page.waitForTimeout(10);
    const start=page.locator('[data-a="quiz-topic"]').first();
    await expect(start).toBeVisible();
    await start.evaluate(el=>{for(let i=0;i<17;i++)el.dispatchEvent(new MouseEvent("click",{bubbles:true}))});
    await expect(page.locator(".question-card")).toBeVisible();
    const answer=page.locator('[data-a="answer"]').first();
    await expect(answer).toBeVisible();
    await answer.click();
    const next=page.locator('[data-a="next"]').first();
    await expect(next).toBeVisible();
    await next.evaluate(el=>{for(let i=0;i<7;i++)el.dispatchEvent(new MouseEvent("click",{bubbles:true}))});
    await expect(page.locator(".question-meta")).toContainText("سؤال 2 از");
    if(round%3===0){
      await page.setViewportSize({width:800,height:390});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await page.setViewportSize({width:320,height:800});
    }
    if(round%4===0){
      await page.keyboard.press("Escape");
      await page.evaluate(()=>location.hash="#home");
      await expect(page.locator(".hero")).toBeVisible();
    }
    if(round%5===0){
      await page.evaluate(r=>localStorage.setItem("arabic8-lesson1-progress-v4",JSON.stringify(r)),{xp:"💀",daily:[],streak:{current:Infinity,best:-99,lastActive:"banana"},review:{x:{interval:Infinity,ease:"x",due:"banana"}},completedTopics:[9,"x","x"],mistakes:[null,"x"],examAttempts:[{correct:99,total:-2}]});
      await page.reload();
      await expect(page.locator(".hero")).toBeVisible();
      await page.evaluate(()=>location.hash="#topic/colors");
      await page.waitForTimeout(10);
    }
    if(round%10===0){
      await page.reload();
      await expect(page.locator(".hero,.lesson")).toBeVisible();
    }
  }
});

test("adversarial stale controls cannot resurrect an exited quiz",async({page})=>{
  page.on("dialog",d=>d.accept());
  await page.goto("/#topic/colors");
  const start=page.locator('[data-a="quiz-topic"]').first();
  const staleStart=await start.elementHandle();
  await staleStart?.evaluate(el=>el.click());
  await expect(page.locator(".question-card")).toBeVisible();
  await page.evaluate(()=>location.hash="#practice");
  await expect(page.locator(".hero,.adaptive-card")).toBeVisible();
  await staleStart?.evaluate(el=>el.dispatchEvent(new MouseEvent("click",{bubbles:true})));
  expect(await page.locator(".question-card").count()).toBe(0);
});
