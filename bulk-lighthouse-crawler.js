/**
 * This program crawls through a website that has 100s of URLs. For each URL there, it generates lighthouse report and appends to
 * a .csv file.
 */

const fs = require('fs');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'lighthouse-results2.csv',
  header: [
    {id: 'URL', title: 'URL'},
    {id: 'Performance', title: 'Performance'},
    {id: 'Accessibility', title: 'Accessibility'},
    {id: 'Best_Practices', title: 'Best_Practices'},
    {id: 'SEO', title: 'SEO'}
  ]
});

const chromeLauncher = require('chrome-launcher');
const request = require('request');
const util = require('util');

const options = {
  logLevel: 'info',
  disableDeviceEmulation: true,
  chromeFlags: ['--disable-mobile-emulation'],
  output: 'json'
};

let result = [];

async function lighthouseFromPuppeteer(options, config = null) {
  const browser1 = await puppeteer.launch({headless:false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'});
  const page1 = await browser1.newPage();

  //go to a website to gather URLs and store them in an array
  await page1.goto('https://ahrefs.com/blog/most-visited-websites/');

  const data1 = await page1.$$eval('#tablepress-76 tr', rows => {
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td');
      return Array.from(columns, column => column.innerText);
    });
  });
  
  
  await browser1.close();

  // Launch chrome using chrome-launcher
  const chrome = await chromeLauncher.launch(options);
  options.port = chrome.port;

  // Connect chrome-launcher to puppeteer
  const resp = await util.promisify(request)(`http://localhost:${options.port}/json/version`);
  const { webSocketDebuggerUrl } = JSON.parse(resp.body);
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

  for (let i=1;i<data1.length;i++) {
  //for (let i=1;i<5;i++) {  
    // Run Lighthouse
    console.log('https://'+data1[i][1]);
    const { lhr } = await lighthouse('https://'+data1[i][1], options, config);
    result.push({URL: lhr.finalUrl, Performance: lhr.categories.performance.score, Accessibility: lhr.categories.accessibility.score, Best_Practices: lhr.categories['best-practices'].score, SEO: lhr.categories.seo.score});
  }

  await browser.disconnect();
  await chrome.kill();


  csvWriter
  .writeRecords(result)
  .then(()=> console.log('The CSV file was written successfully'));


}

lighthouseFromPuppeteer(options);
