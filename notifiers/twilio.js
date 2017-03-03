var twilio = require('twilio');

module.exports = function (config) {
    var twilioClient = new twilio.RestClient(config.twilioSid,
                                             config.twilioToken);

    return function (ad) {
        var body = ad.title + ' (' + ad.price + ')\n' + ad.link + '\n';
        for (var score in ad.scores) {
            body += '\n' + score + ': ' + parseInt(ad.scores[score], 10);
        }

        twilioClient.messages.create({
            body: body,
            mediaUrl: ad.image,
            to: config.twilioTo,
            from: config.twilioFrom
        });
    }
};
