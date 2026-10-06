import {defineConfig} from "@playwright/test";

export default defineConfig({
  testDir:"tests",
  timeout:30000,
  use:{
    baseURL:"http://127.0.0.1:4173",
    viewport:{width:390,height:844},
    isMobile:true,
    hasTouch:true,
    reducedMotion:"reduce"
  },
  webServer:{
    command:"python3 -m http.server 4173",
    url:"http://127.0.0.1:4173",
    reuseExistingServer:true,
    timeout:15000
  }
});
