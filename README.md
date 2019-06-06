# ssperf

  > A project for helping measure the performance of our demo SmartSites.

This tool gets its performance data from Lighthouse and uses Puppeteer to take screenshots.


## Usage

```sh
    ssperf --output results_2019-06-01 --compare-to results_2019-05-30
```

The tool will output the results of the performance report to the command line. It'll go through three pages (home, inventory and details) for every one of our demo sites. You can optionally save the performance report locally to compare against later.


## Output

In your terminal, you'll see a short snapshot of the performance data collected from Lighthouse. If you compare that data to previously-saved reports, you'll see the historical data as well.

Sample output:

```sh
$ ssperf
√ https://www.cwtest086.site/

:|  Performance: 63

:|  First Contentful Paint: 2.7 s
:|  First Meaningful Paint: 3.2 s
:|  Speed Index: 5.2 s
:(  Estimated Input Latency: 150 ms
:)  Server response times are low (TTFB): Root document took 160 ms
:(  First CPU Idle: 7.4 s
--------------------------------------------------------------------------------

√ https://www.cwtest086.site/cars-for-sale

:|  Performance: 80

:|  First Contentful Paint: 2.4 s
:|  First Meaningful Paint: 3.5 s
:)  Speed Index: 3.0 s
:(  Estimated Input Latency: 200 ms
:)  Server response times are low (TTFB): Root document took 140 ms
:(  First CPU Idle: 6.7 s
--------------------------------------------------------------------------------

√ https://www.cwtest086.site/details/used-2007-chevrolet-colorado/47659032

:|  Performance: 50

:|  First Contentful Paint: 3.0 s
:(  First Meaningful Paint: 4.4 s
:(  Speed Index: 6.5 s
:(  Estimated Input Latency: 150 ms
:(  Reduce server response times (TTFB): Root document took 1,100 ms
:(  First CPU Idle: 7.8 s
--------------------------------------------------------------------------------

Time to check https://www.cwtest086.site/: 59411.4165ms
```


## Options

### Output (`-o`, `--output`)

The directory to save reports to. Reports are saved in the Lighthouse report format in JSON. Screenshots are taken for possible visual regression testing (not included).

### Compare To (`-c`, `--compare-to`)

The directory of a previously-saved report to compare to today's report.
