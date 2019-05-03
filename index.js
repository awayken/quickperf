const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');

const demoSites = require('./demo-sites.json');
const config = require('./custom-config.js');

const updateResults = Boolean(process.argv[2]);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    for (const site of demoSites.sites) {
        await page.goto(site);
        await verify(page, `${getSafeName(site)}_home`);

        await page.goto(`${site}cars-for-sale`);
        await verify(page, `${getSafeName(site)}_inventory`);
    }

    await browser.close();
})();

function getSafeName(input) {
    return input.split('www.')[1].replace(/[^\w]/g, '_');
}

async function verify(page, pageName) {
    if (updateResults) {
        await page.screenshot({ path: `./results/${pageName}.png` });
    }

    let historicalMetrics;
    const metricsFilename = `./results/${pageName}.json`;
    const metrics = await gatherLighthouseMetrics(page, config);

    if (updateResults) {
        fs.writeFileSync(metricsFilename, JSON.stringify(metrics, null, 2));
    } else {
        historicalMetrics = JSON.parse(fs.readFileSync(metricsFilename))
    }

    outputMetrics(metrics, historicalMetrics);
}

async function gatherLighthouseMetrics(page, config) {
    // Port is in formаt: ws://127.0.0.1:52046/devtools/browser/675a2fad-4ccf-412b-81bb-170fdb2cc39c
    const port = await page.browser().wsEndpoint().split(':')[2].split('/')[0];

    return await lighthouse(page.url(), { port: port }, config).then(results => {
        delete results.artifacts;

        return results;
    });
}

function outputMetrics(metrics, historicalMetrics) {
    console.log(metrics.lhr.finalUrl);
    console.log('');

    outputPerformance(metrics);

    let historicalSuffix;
    if (historicalMetrics) {
        historicalSuffix = ` (${historicalMetrics.lhr.fetchTime})`;
        outputPerformance(historicalMetrics, historicalSuffix);
    }

    console.log('');

    for (const auditKey of Object.keys(metrics.lhr.audits)) {
        const audit = metrics.lhr.audits[auditKey];
        const historicalAudit = historicalMetrics && historicalMetrics.lhr.audits[auditKey];

        console.log(`${outputScore(audit.score)} ${audit.title}: ${audit.displayValue}`);
        if (historicalAudit) {
            console.log(`${outputScore(historicalAudit.score)} ${historicalAudit.title}: ${historicalAudit.displayValue}${historicalSuffix}`);
        }
    }

    console.log('-'.repeat(80));
    console.log('');
}

function outputPerformance(metrics, logSuffix = '') {
    const performance = metrics.lhr.categories.performance;

    console.log(`${outputScore(performance.score)} ${performance.title}: ${performance.score * 100}${logSuffix}`)
}

function outputScore(score) {
    if (score >= .9) {
        return ':) '
    } else if (score <= .49) {
        return ':( '
    } else {
        return ':| '
    }
}
