/* jslint -W033, -W097, -W117 */
'use strict';
var cheerio, url, Confluence;

cheerio = require('cheerio');
url     = require('url');

/**
 * [function description]
 * @return {[type]} [description]
 */
Confluence = function() {
    this.page = "https://tools.skybet.net/confluence";
}

/**
 * [function description]
 * @param  {[type]}   body [description]
 * @param  {[type]}   data [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
Confluence.prototype.work = function(body, data, cb) {
    var $ = cheerio.load(body);
    var self = this;

    var links = $('.search-results a').map(function (i, el) {
        return url.resolve(self.page,$(this).attr('href'));
    });

    cb(links);
}

module.exports = Confluence;
