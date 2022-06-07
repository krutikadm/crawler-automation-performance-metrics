const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless:false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'});
  const page = await browser.newPage();
  await page.tracing.start({ path: 'profile.json',screenshots: true });
  await page.goto('https://www.yahoo.com/?guccounter=1');
  await page.screenshot({ path: 'screen-3.png' });
  await page.tracing.stop();

   // Extract data from the trace
   const tracing = JSON.parse(fs.readFileSync('./profile.json', 'utf8'));
   const traceScreenshots = tracing.traceEvents.filter(x => (
       x.cat === 'disabled-by-default-devtools.screenshot' &&
       x.name === 'Screenshot' &&
       typeof x.args !== 'undefined' &&
       typeof x.args.snapshot !== 'undefined'
   ));
 
   traceScreenshots.forEach(function(snap, index) {
     fs.writeFile(`trace-screenshot-${index}.png`, snap.args.snapshot, 'base64', function(err) {
       if (err) {
         console.log('writeFile error', err);
       }
     });
   });
  await browser.close();
})();