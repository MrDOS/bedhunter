module.exports = function () {
    return function (ad) {
        var body = ad.title + ' (' + ad.price + ')\n' + ad.link + '\n';
        for (var score in ad.scores) {
            body += '\n' + score + ': ' + parseInt(ad.scores[score], 10);
        }
        console.log(body);
    };
};
