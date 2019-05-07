const { getSafeName } = require('./string-helpers')

test('getSafeName', () => {
    expect(getSafeName()).toBe('')
    expect(getSafeName('A simple string')).toBe('A_simple_string')
    expect(getSafeName('http://whatever.com')).toBe('whatever_com')
    expect(getSafeName('https://www.cwtest086.site/')).toBe('cwtest086_site_')
})
