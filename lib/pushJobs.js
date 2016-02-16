/* jslint -W033, -W097, -W117, -W083, -W104 */
'use strict';

let bs = require('nodestalker'),
    client = bs.Client('127.0.0.1:11300');

let jobs = [ {
    "job": {
        "link": "http://www.football-league.co.uk/sky-bet-championship/news/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.bbc.co.uk",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.skysports.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 30
    },
    "priority": 1,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.dailymail.co.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.reddit.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.sportinglife.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 30
    },
    "priority": 2,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.freebets.org.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.betting-directory.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.marketingweek.co.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 20
    },
    "priority": 3,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.free-bet-advice.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.online-betting.me.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.cheltenham-festival.co.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 20
    },
    "priority": 4,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.themillers.co.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.oddschecker.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.yorkshirepost.co.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.football365.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 20
    },
    "priority": 6,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.wosb.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.betrescue.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.football-data.co.uk/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://linkedin.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.casinomeister.com/rogue/affiliatehub.php",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://gaffg.com/affiliate-programs/affiliate-hub-review/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "https://affiliatehub.skybet.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://www.roguecasinoprograms.com/sky-bet-affiliate-program.html",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "http://facebook.com/",
        "targets": ["http://www.skybet.com", "https://www.skybet.com"],
        "worker": "backlinks",
        "max_links": 10
    },
    "priority": 10,
    "ttr": (60*30)
}, {
    "job": {
        "link": "https://mib37:December 1820!@tools.skybet.net/confluence/dosearchsite.action?queryString=banners",
        "worker": "confluence",
        "max_links": 1
    },
    "priority": 3,
    "ttr": (60*30)
}];

client.use('links').onSuccess(function(data) {
    for (var i in jobs) {
        client.put(JSON.stringify(jobs[i].job), jobs[i].priority).onSuccess(function(data) {
            console.log(data);
        });
    }
});

setTimeout(function() {
    client.disconnect();
}, 2000);
