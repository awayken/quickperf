const {
    getSitesToMeasure,
    convertURLs,
    cleanURLs,
    fetchSites
} = require('./site-helpers');

test('convertURLs empty', () => {
    const nothing = convertURLs();
    expect(nothing).toBeInstanceOf(Array);
    expect(nothing).toHaveLength(0);

    const empty = convertURLs([]);
    expect(empty).toBeInstanceOf(Array);
    expect(empty).toHaveLength(0);
});

test('convertURLs', () => {
    const converted = convertURLs([
        'https://www.cwtest086.site/',
        'https://www.cwtest086.site/cars-for-sale',
        'https://www.cwtest086.site/details/used-2015-dodge-challenger/47659034'
    ]);

    expect(converted).toMatchSnapshot();
});

test('cleanURLs empty', () => {
    const nothing = cleanURLs();
    expect(nothing).toBeInstanceOf(Array);
    expect(nothing).toHaveLength(0);

    const empty = cleanURLs([]);
    expect(empty).toBeInstanceOf(Array);
    expect(empty).toHaveLength(0);
});

test('cleanURLs', () => {
    const cleaned = cleanURLs([
        // Good
        {
            name: 'cwtest086',
            urls: [
                'https://www.cwtest086.site/',
                'https://www.cwtest086.site/cars-for-sale',
                'https://www.cwtest086.site/details/used-2007-chevrolet-colorado/47659032'
            ]
        },
        // Bad!
        {
            name: 'cwtest086'
        },
        // Good again
        {
            name: 'cfs-test3',
            urls: [
                'https://www.cfs-test3.life/',
                'https://www.cfs-test3.life/cars-for-sale',
                'https://www.cfs-test3.life/details/used-2010-mazda-cx-9/47384839'
            ]
        },
        // Also bad!
        {
            urls: [
                'https://www.cwtest086.site/',
                'https://www.cwtest086.site/cars-for-sale',
                'https://www.cwtest086.site/details/used-2007-chevrolet-colorado/47659032'
            ]
        },
        // Bad in a different way!
        'https://www.cwtest086.site/',
        null,
        0
    ]);

    expect(cleaned).toMatchSnapshot();
});

test('fetchSites empty', () => {
    const nothing = fetchSites();
    expect(nothing).toBeInstanceOf(Array);
    expect(nothing).toHaveLength(0);

    const empty = fetchSites('badfile.json');
    expect(empty).toBeInstanceOf(Array);
    expect(empty).toHaveLength(0);
});

test('fetchSites', () => {
    const sites = fetchSites('./test/sites.json');

    expect(sites).toMatchSnapshot();
});

test('getSitesToMeasure empty', () => {
    const nothing = getSitesToMeasure();
    expect(nothing).toBeInstanceOf(Array);
    expect(nothing).toHaveLength(0);

    const empty = getSitesToMeasure([], '');
    expect(empty).toBeInstanceOf(Array);
    expect(empty).toHaveLength(0);
});

test('getSitesToMeasure', () => {
    const sitesConverted = getSitesToMeasure([
        'https://www.cwtest086.site/',
        'https://www.cwtest086.site/cars-for-sale',
        'https://www.cwtest086.site/details/used-2015-dodge-challenger/47659034'
    ]);
    expect(sitesConverted).toMatchSnapshot();

    const sitesFile = getSitesToMeasure([], './test/sites.json');
    expect(sitesFile).toMatchSnapshot();

    const sitesBoth = getSitesToMeasure([
        'https://www.cwtest086.site/',
        'https://www.cwtest086.site/cars-for-sale',
        'https://www.cwtest086.site/details/used-2015-dodge-challenger/47659034'
    ], './test/sites.json');
    expect(sitesBoth).toMatchSnapshot();
});
