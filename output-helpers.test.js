const sampleHistoricalReport = require('./test/sample_historical_report.json')
const sampleReport = require('./test/sample_report.json')
const { outputMetrics } = require('./output-helpers')

test('outputMetrics throws', () => {
    expect(sampleReport.lhr)

    expect(() => {
        outputMetrics(console.log)
    }).toThrow('Metrics is not a proper Lighthouse metrics report.')

    expect(() => {
        outputMetrics(console.log, sampleReport, {})
    }).toThrow('Historical Metrics is not a proper Lighthouse metrics report.')
})

test('outputMetrics', () => {
    const metrics = []
    const outputter = input => { metrics.push(input) }

    outputMetrics(outputter, sampleReport)

    expect(metrics.join('\n')).toMatchSnapshot()
})

test('outputMetrics historical', () => {
    const metrics = []
    const outputter = input => { metrics.push(input) }

    outputMetrics(outputter, sampleReport, sampleHistoricalReport)

    expect(metrics.join('\n')).toMatchSnapshot()
})
