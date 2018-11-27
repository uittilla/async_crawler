/* jslint -W033, -W097, -W117, -W083, -W104 */
'use strict';

const bs = require('nodestalker'),
    client = bs.Client('127.0.0.1:11300');

let ttr = (60 * 30);

let jobs = [
    {
        "job": {
            "link": "https://www.youtube.com/watch?v=yi2bX2u5HpA",
            "worker": "youtube",
            "max_links": 0
        },
        "priority": 3,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.google.co.uk/search?q=Sky+Bet&num=200",
            "targets": "",
            "worker": "serps",
            "maxlinks": ""
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.skysports.com/mobile/apps/9653856/sky-bet",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.racingpost.com/news/sky-bet-buyers-the-stars-group-predict-big-increase-in-revenue-due-to-purchases/346258",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://footyaccumulators.com/football-tips/skybet-request-a-bet",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.glassdoor.co.uk/Overview/Working-at-Sky-Betting-and-Gaming-EI_IE1101771.11,33.htm",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.yorkracecourse.co.uk/news-sky-bet-new-sponsor-as-ebor-soars-to-a-1-million-contest-1.html",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.reed.co.uk/jobs/skybet/p30841",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.britishlegion.org.uk/get-involved/partner-with-us/sky-bet/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.worldpay.com/uk/about/media-centre/2017-02/sky-betting-gaming-selects-worldpay-for-slick-and-seamless-online",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 30
        },
        "priority": 2,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.virginmedia.com/virgin-tv-edit/sport/your-big-week-on-sky-sports.html",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.information-age.com/head-clouds-sky-bets-cloud-deployment-123470971/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 5,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.instagram.com/SkyBet/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.electric-works.net/our-clients/sky-bet/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 3,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.fruitionit.co.uk/skybet/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.online-betting.me.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.cheltenham-festival.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 4,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://totalbet.at/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.oddschecker.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.yorkshirepost.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.football365.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 6,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.bettingzone.co.uk/other/betting/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.betrescue.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.football-data.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://forum.football365.co.za/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.casinomeister.com/rogue/affiliatehub.php",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://gaffg.com/affiliate-programs/affiliate-hub-review/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://affiliatehub.skybet.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.roguecasinoprograms.com/sky-bet-affiliate-program.html",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.planetf1.com/driver/3213/7109117/Ricciardo-Nothing-is-guaranteed",
            "targets": ["http://www.skybet.com", "https://www.skybet.com", "http://m.skybet.com", "https://m.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }
];

client.use('links').onSuccess(function (data) {
    let i = 0;
    for (i in jobs) {
        client.put(JSON.stringify(jobs[i].job), jobs[i].priority).onSuccess(function (data) {
            console.log(data);
        });
    }
});

setTimeout(function () {
    client.disconnect();
}, 2000);


