/**
 * This file takes a CSV file as input. Each row represents one URL. After gathering all URLs into an array, 
 * it runs lighthouse against each of them, gathers performance metrics and appends to a .csv file.
 */
const fs = require('fs');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
//const { Cluster } = require('puppeteer-cluster');

/**
 * Read the URL.csv file that contains all URL. Put each element as an element in an array.
 */
var array = fs.readFileSync("URLs.csv")
				.toString().split("\n");


const chromeLauncher = require('chrome-launcher');
const reportGenerator = require('lighthouse/report/generator/report-generator');
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
  // Launch chrome using chrome-launcher
  const chrome = await chromeLauncher.launch(options);
  options.port = chrome.port;

  // Connect chrome-launcher to puppeteer
  const resp = await util.promisify(request)(`http://localhost:${options.port}/json/version`);
  const { webSocketDebuggerUrl } = JSON.parse(resp.body);
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

  for (i in array) {
    // Run Lighthouse
    const { lhr } = await lighthouse(array[i], options, config);
    result.push({URL: lhr.finalUrl, Performance: lhr.categories.performance.score, Accessibility: lhr.categories.accessibility.score, Best_Practices: lhr.categories['best-practices'].score, SEO: lhr.categories.seo.score});
  }

  await browser.disconnect();
  await chrome.kill();


  /**
   * Create a .csv file. Write the whole array data into it.
   */
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: 'lighthouse-results1.csv',
    header: [
      {id: 'URL', title: 'URL'},
      {id: 'Performance', title: 'Performance'},
      {id: 'Accessibility', title: 'Accessibility'},
      {id: 'Best_Practices', title: 'Best_Practices'},
      {id: 'SEO', title: 'SEO'}
    ]
  });
  csvWriter
  .writeRecords(result)
  .then(()=> console.log('The CSV file was written successfully'));


}

lighthouseFromPuppeteer(options);
