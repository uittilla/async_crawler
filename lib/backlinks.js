/* jslint -W033, -W097, -W117, -W104 */
'use strict';

var cheerio = require('cheerio');

/**
 *
 */
class Backlinks {
    /**
     * [constructor Backlinks]
     * @return {[type]} [description]
     */
    constructor() { }

    /**
     * [work method]
     * @param  {[type]}   body [page body]
     * @param  {[type]}   data [queue data]
     * @param  {Function} cb   [function]
     * @return {[function]}    [cb]
     */
    work(body, data, cb){
        var $ = cheerio.load(body);
        return cb(this.matchTargets($, this.createTargetRegex(data.targets)));
    }

    /**
     * [createTargetRegex method]
     * @param  {[type]} masters [array]
     * @return {[master_regex]}         [function]
     */
    createTargetRegex(masters) {
        var term, master, master_regex = "";
        for (master in masters) {
            if (masters.hasOwnProperty(master)) {
                term = masters[master];
                master_regex += 'a[href^="' + term + '"],';
            }
        }

        return master_regex.slice(0, -1);
    }

    /**
     * [matchTargets matchTargets]
     * @param  {[class]} $      [cheerio]
     * @param  {[type]} masters [array]
     * @return {[array]}        [targets]
     */
    matchTargets($, masters) {
        // Target matching
        var j = 0, self = this;

        var targets = $(masters).map(function (i, el) {
            j++;
            self.matched++;
            return {
                "href": $(this).attr('href'),
                "anchor": $(this).html()
            };
        });

        return targets;
    }
}

module.exports = Backlinks;
