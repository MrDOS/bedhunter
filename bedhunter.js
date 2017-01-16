#! /usr/bin/env node

var fs = require('fs');
var kijiji = require('kijiji-scraper');
var sqlite3 = require('sqlite3');

var config = {};
try {
    config = require('./config.json');
} catch (e) {
    console.log("Failed to load configuration:");
    console.log(e);
    process.exit(1);
}
config.query.prefs.scrapeInnerAd = false;

var db = new sqlite3.Database('bedhunter.db');
db.run('create table if not exists ad (url text primary key, summary json, details json)');

/**
 * Check Kijiji for new ads. Does not query into them.
 */
var queryAds = function () {
    kijiji.query(config.query.prefs, config.query.params, function (err, ads) {
        if (err !== null) {
            console.log(err);
            return;
        }

        var stmt = db.prepare('insert or ignore into ad (url, summary) values (?, ?)');
        ads.forEach(function (ad) {
            stmt.run(ad.url, JSON.stringify(ad));
        });
        stmt.finalize();
    });
};

queryAds();
