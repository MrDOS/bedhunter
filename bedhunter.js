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
db.run('create table if not exists score (url text, heuristic text, score double)');

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
            stmt.run(ad.link, JSON.stringify(ad));
        });
        stmt.finalize();

        scrapeAds();
    });
};

var scrapeAds = function () {
    var stmt = db.prepare('update ad set details = ? where url = ?');
    db.each('select url from ad where details is null', function (err, ad) {
        if (err != null) {
            console.log(err);
            return;
        }

        kijiji.scrape(ad.url, function (err, details) {
            stmt.run(JSON.stringify(details), ad.url);
        });
    });
};

queryAds();
