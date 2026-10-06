import {test,expect} from "@playwright/test";

test("mobile navigation and core routes remain usable",async({page})=>{
  await page.goto("/");
  await expect(page.locator("main#app")).toBeVisible();
  await expect(page.locator(".mobile-nav")).toBeVisible();
  await expect(page.locator(".sidebar")).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  for(const route of ["learn","practice","exam","progress"]){
    await page.locator('.mobile-nav a[data-route="'+route+'"]').click();
    await expect(page).toHaveURL(new RegExp("#"+route+"$"));
    await expect(page.locator("main#app")).toBeVisible();
  }

  await page.goto("/#diagnostic");
  await page.getByRole("button",{name:"شروع"}).click();
  await expect(page.locator(".option").first()).toBeVisible();
  await page.locator(".option").first().click();
  await expect(page.locator("#feedback")).toBeVisible();
  await expect(page.locator("#feedback")).toHaveAttribute("aria-live","polite");

  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
