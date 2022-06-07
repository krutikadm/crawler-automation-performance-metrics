const puppeteer = require('puppeteer');

(async () => {
const browser = await puppeteer.launch({headless:false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'});
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  await page.goto('https://google.com');
  await page.setViewport({ width: 1440, height: 714 });

  await navigationPromise;
  const selector = 'body > sidebar-component > sidebar-item:nth-child(3) > .sidebar-item';
  await page.waitForSelector(selector);
  await page.tracing.start({path: 'trace1.json', screenshots: true});
  await page.click(selector);
  await page.tracing.stop();

  await browser.close();
})();
