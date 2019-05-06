function getSafeName(input) {
    return input.split('www.')[1].replace(/[^\w]/g, '_');
}

module.exports = {
    getSafeName
};
