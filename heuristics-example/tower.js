exports.tower = function (ad, callback) {
    if (ad.title.match(/tower|condo/i)
        || ad.innerAd.desc.match(/tower|condo/)) {
        callback(null, 0);
    } else if (ad.innerAd.info.Address.match(/^The /i)) {
        callback(null, 50);
    } else {
        callback(null, 100);
    }
};
