function outputMetrics(outputter, metrics, historicalMetrics) {
    outputter('');

    outputPerformance(outputter, metrics);

    let historicalSuffix;
    if (historicalMetrics) {
        historicalSuffix = ` (${historicalMetrics.lhr.fetchTime})`;
        outputPerformance(outputter, historicalMetrics, historicalSuffix);
    }

    outputter('');

    for (const auditKey of Object.keys(metrics.lhr.audits)) {
        const audit = metrics.lhr.audits[auditKey];
        const historicalAudit = historicalMetrics && historicalMetrics.lhr.audits[auditKey];

        outputter(`${outputScore(audit.score)} ${audit.title}: ${audit.displayValue}`);
        if (historicalAudit) {
            outputter(`${outputScore(historicalAudit.score)} ${historicalAudit.title}: ${historicalAudit.displayValue}${historicalSuffix}`);
        }
    }

    outputter('-'.repeat(80));
    outputter('');
}

function outputPerformance(outputter, metrics, suffix = '') {
    const performance = metrics.lhr.categories.performance;

    outputter(`${outputScore(performance.score)} ${performance.title}: ${performance.score * 100}${suffix}`)
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

module.exports = {
    outputMetrics
};
