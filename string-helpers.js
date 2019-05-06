function getSafeName(input = '') {
    let inputToReplace = input;

    if (inputToReplace.indexOf('://') > -1) {
        inputToReplace = inputToReplace.split('://')[1];
    }

    if (inputToReplace.indexOf('www.') > -1) {
        inputToReplace = inputToReplace.split('www.')[1];
    }

    return inputToReplace.replace(/[^\w]+/g, '_');
}

module.exports = {
    getSafeName
};
