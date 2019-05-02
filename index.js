const puppeteer = require('puppeteer');
const demoSites = require('./demo-sites.json');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(demoSites.sites[0]);
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
