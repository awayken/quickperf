import test from 'ava';

import sampleHistoricalReport from './test/sample_historical_report.json';
import sampleReport from './test/sample_report.json';
import { outputMetrics } from './output-helpers';
import { getSafeName } from './string-helpers';

test('getSafeName', t => {
    t.is(getSafeName(), '');
    t.is(getSafeName('A simple string'), 'A_simple_string');
    t.is(getSafeName('http://whatever.com'), 'whatever_com');
    t.is(getSafeName('https://www.cwtest086.site/'), 'cwtest086_site_');
});

test('outputMetrics throws', t => {
    t.truthy(sampleReport.lhr, 'Reports require lhr key');

    const badMetrics = t.throws(() => {
        outputMetrics(console.log);
    });

    t.is(badMetrics.message, 'Metrics is not a proper Lighthouse metrics report.')

    const badHistoricalMetrics = t.throws(() => {
        outputMetrics(console.log, sampleReport, {});
    });

    t.is(badHistoricalMetrics.message, 'Historical Metrics is not a proper Lighthouse metrics report.')
});


test('outputMetrics', t => {
    const metrics = [];
    const outputter = input => { metrics.push(input) };

    outputMetrics(outputter, sampleReport);

    t.snapshot(metrics.join('\n'));
});

test('outputMetrics historical', t => {
    const metrics = [];
    const outputter = input => { metrics.push(input) };

    outputMetrics(outputter, sampleReport, sampleHistoricalReport);

    t.snapshot(metrics.join('\n'));
});
