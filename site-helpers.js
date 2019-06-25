const fs = require('fs');

function convertURLs(urlsToConvert = []) {
    return urlsToConvert.map(siteURL => {
        return {
            name: siteURL,
            urls: [ siteURL ]
        }
    });
}

function fetchSites(sitesFilePath = '') {
    let sites = [];

    if (sitesFilePath.length) {
        if (fs.existsSync(sitesFilePath)) {
            const sitesFile = fs.readFileSync(sitesFilePath);
            const sitesData = JSON.parse(sitesFile);

            if (sitesData.sites) {
                sites = sitesData.sites;
            }
        }
    }

    return sites;
}

function cleanURLs(urlsToClean = []) {
    return urlsToClean.filter(possibleSite => possibleSite && possibleSite.name && possibleSite.urls);
}

function getSitesToMeasure(urlsToConvert = [], sitesFilePath = '') {
    const converted = convertURLs(urlsToConvert);
    const cleaned = cleanURLs(fetchSites(sitesFilePath));

    return [...converted, ...cleaned];
}

module.exports = {
    getSitesToMeasure,
    convertURLs,
    cleanURLs,
    fetchSites
};
