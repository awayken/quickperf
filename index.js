#!/usr/bin/env node

'use strict';

const { performance, PerformanceObserver } = require('perf_hooks');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const commander = require('commander');
const ora = require('ora');
const fs = require('fs');

const { outputMetrics } = require('./output-helpers.js');
const { getSafeName } = require('./string-helpers.js');
const demoSites = require('./demo-sites.json');
const packageInfo = require('./package.json');
const config = require('./custom-config.js');


/*
    Define CLI options
*/
const program = new commander.Command('ssperf')
    .version(packageInfo.version, '-v, --version')
    .description(packageInfo.description)
    .option('-o, --output <folder>', 'the directory to save latest perf reports')
    .option('-c, --compare-to <folder>', 'the directory to compare perf reports against')
    .parse(process.argv);


/*
    Gather Lighthouse Metrics
*/
async function gatherLighthouseMetrics(page, config) {
    // Port is in formаt: ws://127.0.0.1:52046/devtools/browser/675a2fad-4ccf-412b-81bb-170fdb2cc39c
    const port = await page.browser().wsEndpoint().split(':')[2].split('/')[0];

    // Fetch Lighthouse data
    return await lighthouse(page.url(), { port: port }, config).then(results => {
        delete results.artifacts;

        return results;
    });
}


/*
    Check the page
*/
async function checkPage(page, pageName, spinner) {
    let historicalMetrics;

    // Variables for asset saving
    const resultsDirectory = `${program.output || ''}`;
    const screenshotFilename = `${resultsDirectory}/${pageName}.png`;
    const metricsFilename = `${resultsDirectory}/${pageName}.json`;
    const historicalFilename = `${program.compareTo}/${pageName}.json`;

    // Gather Lighthouse Metrics
    const metrics = await gatherLighthouseMetrics(page, config);

    if (program.output) {
        // Create output folder if we need to
        if (!fs.existsSync(resultsDirectory)) {
            fs.mkdirSync(resultsDirectory, { recursive: true });
        }

        // Save screenshot
        await page.screenshot({ path: screenshotFilename });

        // Save metrics file
        fs.writeFileSync(metricsFilename, JSON.stringify(metrics, null, 2));
    }
    
    // Get comparison metrics
    if (program.compareTo) {
        if (fs.existsSync(historicalFilename)) {
            historicalMetrics = JSON.parse(fs.readFileSync(historicalFilename));
        }
    }

    // Stop spinner
    spinner.succeed();

    outputMetrics(console.log, metrics, historicalMetrics);
}


/*
    Our main program
*/
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Setup performance observer
    const obs = new PerformanceObserver(list => {
        // Get most recent entry
        const entry = list.getEntries()[0];

        // Log out the measurement
        console.log(`Time to check ${entry.name}:`, `${entry.duration}ms`, '\n');
    });

    obs.observe({ entryTypes: ['measure'] });

    // Loop through our sites
    for (const site of [demoSites.sites[0]]) {
        performance.mark(`${site}-start`);

        const siteSafeName = getSafeName(site);
        
        // Home Page
        const homeSpinner = ora(site).start();
        await page.goto(site);
        await checkPage(page, `${siteSafeName}_home`, homeSpinner);

        // Inventory Page
        const inventorySpinner = ora(`${site}cars-for-sale`).start();
        await page.goto(`${site}cars-for-sale`);
        await checkPage(page, `${siteSafeName}_inventory`, inventorySpinner);

        // Details page
        const firstSearchResult = await page.$eval('a[href^="/details"]', item => item.getAttribute('href').slice(1));
        const detailsSpinner = ora(`${site}${firstSearchResult}`).start();
        await page.goto(`${site}${firstSearchResult}`);
        await checkPage(page, `${siteSafeName}_details`, detailsSpinner);

        performance.mark(`${site}-end`);
        performance.measure(site, `${site}-start`, `${site}-end`);
    }

    await browser.close();
})();
