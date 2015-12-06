var cheerio = require('cheerio');

var Backlinks = function() {}

Backlinks.prototype.work = function(body, data, cb){
    var $ = cheerio.load(body);
    var links = this.matchTargets($, this.createTargetRegex(data.targets));
    cb(links);
}

/**
 * Build a Target URL regex
 * Avoids closure memory leek
 *
 * I.E.
 *
 * for (var i in masters) {
 *     term = masters[i];
 *     $("a[href^='" + term + "']").each(function () {
 *
 * @param masters
 * @returns {string}
 */
Backlinks.prototype.createTargetRegex = function(masters) {
    var term, master, master_regex = "";
    for (master in masters) {
        if(masters.hasOwnProperty(master)) {
            term = masters[master];
            master_regex += 'a[href^="' + term + '"],';
        }
    }

    return master_regex.slice(0, -1);
};

/**
 * Find any matching Target links on page
 * Stores the uri and its anchor text if true
 *
 * @param $
 * @param masters
 * @returns array
 */
Backlinks.prototype.matchTargets = function ($, masters) {
    // Target matching
    var j = 0, self = this;

    var targets = $(masters).map(function (i, el) {
        j++;
        self.matched++;
        return {
            "href"   : $(this).attr('href'),
            "anchor" : $(this).html()
        };
    });

    return targets;
};

module.exports = Backlinks;
