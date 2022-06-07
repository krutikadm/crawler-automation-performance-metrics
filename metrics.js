const puppeteer = require('puppeteer');

// Get Runtime Performance Metrics

(async () => {
    const browser = await puppeteer.launch({headless:false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'});
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com/');

    const metrics = await page.metrics();
    console.info(metrics);

    await browser.close();
})();