#!/usr/bin/env node

'use strict';

const { performance, PerformanceObserver } = require('perf_hooks');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const commander = require('commander');
const ora = require('ora');
const fs = require('fs');

const { getSitesToMeasure } = require('./site-helpers.js');
const { outputMetrics } = require('./output-helpers.js');
const { getSafeName } = require('./string-helpers.js');
const packageInfo = require('./package.json');
const config = require('./custom-config.js');


/*
    Define CLI options
*/
const program = new commander.Command('quickperf')
    .version(packageInfo.version, '-v, --version')
    .description(packageInfo.description)
    .arguments('[siteurls]')
    .option('-s, --sites <sites.json>', 'the JSON file that defines which URLs to measure')
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

    await page.setViewport({
        width: 1280,
        height: 1024
    });

    const sitesToMeasure = getSitesToMeasure(program.args, program.sites);
    let sitesWithFailures = 0;

    if (!sitesToMeasure.length) {
        console.error('!! You did not provide any sites to measure.', '\n');

        program.outputHelp();
    }

    // Loop through our sites to measure
    for (const site of sitesToMeasure) {
        let pageHasFailures = false;
        
        // Require a certain structure for our site
        if (!site || !site.name || !site.urls) {
            pageHasFailures = true;
        }
        
        if (!pageHasFailures) {
            const siteSafeName = getSafeName(site.name);
            
            performance.mark(`${siteSafeName}-start`);
            
            // Loop through every URL for this site
            for (let i = 0, len = site.urls.length; i < len; i++) {
                const url = site.urls[i];
                const spinner = ora(url).start();

                await page.goto(url)
                    .then(() => checkPage(page, `${siteSafeName}_${i}`, spinner))
                    .catch(err => {
                        pageHasFailures = true;
                        spinner.warn(err.message);
                    });
            }

            performance.mark(`${siteSafeName}-end`);
            performance.measure(siteSafeName, `${siteSafeName}-start`, `${siteSafeName}-end`);
        }

        if (pageHasFailures) {
            sitesWithFailures++;
        }

        if (sitesWithFailures > 3) {
            console.error('!! Too many sites gave response errors. Check your network settings and try again.', '\n');
            break;
        }
    }

    await browser.close();
})();
