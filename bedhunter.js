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

var heuristics = {};
fs.readdirSync(__dirname + '/heuristics').forEach(function(file) {
    if (file.match(/.js$/)) {
        var heuristic = require('./heuristics/' + file);
        for (key in heuristic) {
            heuristics[key] = heuristic[key];
        }
    }
});

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

        var stmt = db.prepare('insert into ad (url, summary) values (?, ?)');
        ads.forEach(function (ad) {
            stmt.run(ad.link, JSON.stringify(ad), function (err) {
                if (err != null)
                {
                    return;
                }

                scrapeAd(ad);
            });
        });
    });
};

var scrapeAd = function (ad) {
    var stmt = db.prepare('update ad set details = ? where url = ?');

    kijiji.scrape(ad.link, function (err, details) {
        if (err != null) {
            console.log(err);
            return;
        }

        ad.innerAd = details;
        stmt.run(JSON.stringify(details), ad.link, function () {
            if (err != null)
            {
                console.log(err);
                return;
            }

            scoreAd(ad);
        });
    });
};

var scoreAd = function (ad) {
    var stmt = db.prepare('insert into score (url, heuristic, score) values (?, ?, ?)');

    for (heuristic in heuristics) {
        heuristics[heuristic](ad, function (err, score) {
            if (err != null) {
                console.log(err);
                return;
            }

            console.log(ad.title + ' -> ' + heuristic + ': ' + score + '/100');
            stmt.run(ad.link, heuristic, score);
        });
    }
};

queryAds();
