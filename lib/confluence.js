var cheerio = require('cheerio');
var url = require('url');

var Confluence = function() {
    this.page = "https://tools.skybet.net/confluence";
}

Confluence.prototype.work = function(body, data, cb) {
    var $ = cheerio.load(body);
    var self = this;

    var links = $('.search-results a').map(function (i, el) {
        return url.resolve(self.page,$(this).attr('href'));
    });

    cb(links);
}

module.exports = Confluence;
