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

var defineSchema = function () {
    return new Promise(function (resolve) {
        console.log('Defining database schema...');

        db.run('create table if not exists ad (link text primary key, summary json, details json)', function () {
            db.run('create table if not exists score (link text, heuristic text, score double, foreign key (link) references ad (link))', function () {
                db.run('drop table if exists heuristic', function () {
                    db.run('create table heuristic (heuristic text primary key)', function () {
                        var stmt = db.prepare('insert into heuristic (heuristic) values (?)');
                        var inserted = 0;

                        var heuristicKeys = Object.keys(heuristics);
                        heuristicKeys.forEach(function (heuristic) {
                            stmt.run(heuristic, function () {
                                if (++inserted === heuristicKeys.length) {
                                    console.log('Defined heuristics in database.');
                                    stmt.finalize();
                                    resolve();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};

/**
 * Check Kijiji for new ads. Does not query into them.
 */
var queryAdsIntoDatabase = function () {
    return new Promise(function (resolve) {
        console.log('Querying latest ads...');

        kijiji.query(config.query.prefs, config.query.params, function (err, ads) {
            if (err !== null) {
                console.log(err);
                resolve();
            } else if (ads.length == 0) {
                console.log('Kijiji returned no ads.');
                resolve();
            } else {
                var stmt = db.prepare('insert into ad (link, summary) values (?, ?)');
                var inserted = 0;

                ads.forEach(function (ad) {
                    stmt.run(ad.link, JSON.stringify(ad), function () {
                        if (++inserted === ads.length) {
                            console.log('Retrieved latest ads.');
                            stmt.finalize();
                            resolve();
                        }
                    });
                });
            }
        });
    });
};

var scrapeAllUnscrapedAds = function () {
    return new Promise(function (resolve) {
        console.log('Retrieving ad details...');

        db.all('select link, summary from ad where details is null', function (err, ads) {
            if (err != null)
            {
                console.log(err);
                resolve();
            } else if (ads.length == 0) {
                console.log('No ads without details.');
                resolve();
            } else {
                var stmt = db.prepare('update ad set details = ? where link = ?');
                var inserted = 0;

                ads.forEach(function (ad) {
                    kijiji.scrape(ad.link, function (err, details) {
                        if (err == null) {
                            ad.innerAd = details;
                            stmt.run(JSON.stringify(details), ad.link);
                        }

                        if (++inserted === ads.length) {
                            console.log('Retrieved ad details.');
                            stmt.finalize();
                            resolve();
                        }
                    });
                });
            }
        });
    });
};

var scoreAllAdsMissingScores = function () {
    return new Promise(function (resolve) {
        console.log('Scoring ads...');

        db.all(`
   select heuristic.heuristic,
          ad.summary,
          ad.details
     from heuristic
left join ad
left join score on score.link = ad.link and score.heuristic = heuristic.heuristic
    where score.score is null
               `, function (err, rows) {
            if (err !== null) {
                console.log(err);
                resolve();
            } else if (rows.length == 0) {
                console.log('No unscored ads.');
                resolve();
            } else {
                var stmt = db.prepare('insert into score (link, heuristic, score) values (?, ?, ?)');
                var inserted = 0;

                rows.forEach(function (row) {
                    var ad = JSON.parse(row.summary);
                    ad.innerAd = JSON.parse(row.details);

                    heuristics[row.heuristic](ad, function (err, score) {
                        if (err == null) {
                            stmt.run(ad.link, row.heuristic, score);
                        }

                        if (++inserted === rows.length) {
                            console.log('Scored ads.');
                            stmt.finalize();
                            resolve();
                        }
                    });
                });

                resolve();
            }
        });
    });
};

var process = function ()
{
    queryAdsIntoDatabase()
        .then(() => scrapeAllUnscrapedAds())
        .then(() => scoreAllAdsMissingScores())
        .then(() => setTimeout(process, config.query.interval));
}

defineSchema()
    .then(process);
