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
    Gather Lighthouse Metrics
*/
async function gatherLighthouseMetrics(page, config) {
    // Port is in formаt: ws://127.0.0.1:52046/devtools/browser/675a2fad-4ccf-412b-81bb-170fdb2cc39c
    const port = await page.browser().wsEndpoint().split(':')[2].split('/')[0];

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

    const resultsDirectory = `${__dirname}/results`;
    const screenshotFilename = `${resultsDirectory}/${pageName}.png`;
    const metricsFilename = `${resultsDirectory}/${pageName}.json`;

    const metrics = await gatherLighthouseMetrics(page, config);

    if (program.update) {
        await page.screenshot({ path: screenshotFilename });
    }

    if (program.update) {
        fs.writeFileSync(metricsFilename, JSON.stringify(metrics, null, 2));
    } else {
        if (fs.existsSync(metricsFilename)) {
            historicalMetrics = JSON.parse(fs.readFileSync(metricsFilename));
        }
    }

    spinner.succeed();

    outputMetrics(console.log, metrics, historicalMetrics);
}


/*
    Our main program
*/
const program = new commander.Command('ssperf')
    .version(packageInfo.version, '-v, --version')
    .description(packageInfo.description)
    .option('-u, --update', 'update historical metrics')
    .parse(process.argv);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const obs = new PerformanceObserver(list => {
        // Get most recent entry
        const entry = list.getEntries()[0];

        // Log out the measurement
        console.log(`Time to check ${entry.name}:`, `${entry.duration}ms`, '\n');
    });

    obs.observe({ entryTypes: ['measure'] });

    for (const site of demoSites.sites) {
        performance.mark(`${site}-start`);

        const siteSafeName = getSafeName(site);
        
        const homeSpinner = ora(site).start();
        await page.goto(site);
        await checkPage(page, `${siteSafeName}_home`, homeSpinner);

        const cfsSpinner = ora(`${site}cars-for-sale`).start();
        await page.goto(`${site}cars-for-sale`);
        await checkPage(page, `${siteSafeName}_inventory`, cfsSpinner);

        performance.mark(`${site}-end`);
        performance.measure(site, `${site}-start`, `${site}-end`);
    }

    await browser.close();
})();
