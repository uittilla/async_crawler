/* jslint -W033, -W097, -W117, -W083, -W104 */
'use strict';

const bs = require('nodestalker'),
    client = bs.Client('127.0.0.1:11300');

let ttr = (60 * 30);

let jobs = [
    {
        "job": {
            "link": "https://m.nps.skybet.com",
            "headers": {
                  "X-Betweb":"true", 
                  "X-ID":"npsbetweb63.skybet.net"
            },
            "targets": "",
            "worker": "images",
            "max_links": 250
        },
        "priority": 1,
        "ttr": ttr
    },
    {   
        "job": {
            "link": "https://m.nps.skybet.com",
            "headers": {
                  "X-Betweb":"true", 
                  "X-ID":"npsbetweb63.skybet.net"
            },  
            "targets": "", 
            "worker": "images",
            "max_links": 250 
        },  
        "priority": 1,
        "ttr": ttr 
    },
    {   
        "job": {
            "link": "https://m.nps.skybet.com",
            "headers": {
                  "X-Betweb":"true", 
                  "X-ID":"npsbetweb63.skybet.net"
            },  
            "targets": "", 
            "worker": "images",
            "max_links": 250 
        },  
        "priority": 1,
        "ttr": ttr 
    },
    {   
        "job": {
            "link": "https://m.nps.skybet.com",
            "headers": {
                  "X-Betweb":"true", 
                  "X-ID":"npsbetweb63.skybet.net"
            },  
            "targets": "", 
            "worker": "images",
            "max_links": 250 
        },  
        "priority": 1,
        "ttr": ttr 
    },
    {   
        "job": {
            "link": "https://m.nps.skybet.com",
            "headers": {
                  "X-Betweb":"true", 
                  "X-ID":"npsbetweb63.skybet.net"
            },  
            "targets": "", 
            "worker": "images",
            "max_links": 250 
        },  
        "priority": 1,
        "ttr": ttr 
    }
/*
    , {
        "job": {
            "link": "https://www.youtube.com/watch?v=yi2bX2u5HpA",
            "worker": "youtube",
            "max_links": 0
        },
        "priority": 3,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://www.google.co.uk/search?q=sky+bet&num=100",
            "targets": "",
            "worker": "serps",
            "maxlinks": ""
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.sportal.com",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.extreme365.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 50
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.golf365.com/features_story/0,17923,15870_5997668,00.html",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 50
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.football-league.co.uk/sky-bet-championship/news/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.skysports.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 1,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://casino.oddschecker.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.bettingzone.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.football365.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 30
        },
        "priority": 2,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.freebets.org.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.teamtalk.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 100
        },
        "priority": 5,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.bestbookmakers.net/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.marketingweek.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 3,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.free-bet-advice.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.online-betting.me.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.cheltenham-festival.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 4,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://totalbet.at/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.oddschecker.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.yorkshirepost.co.uk/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.football365.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 20
        },
        "priority": 6,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.bettingzone.co.uk/other/betting/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
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
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://forum.football365.co.za/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.casinomeister.com/rogue/affiliatehub.php",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://gaffg.com/affiliate-programs/affiliate-hub-review/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "https://affiliatehub.skybet.com/",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.roguecasinoprograms.com/sky-bet-affiliate-program.html",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }, {
        "job": {
            "link": "http://www.planetf1.com/driver/3213/7109117/Ricciardo-Nothing-is-guaranteed",
            "targets": ["http://www.skybet.com", "https://www.skybet.com"],
            "worker": "backlinks",
            "max_links": 10
        },
        "priority": 10,
        "ttr": ttr
    }
    */
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


