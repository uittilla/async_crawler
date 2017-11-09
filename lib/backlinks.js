/* jslint -W033, -W097, -W117, -W104 */
'use strict';

const Cheerio = require('cheerio');

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
     * @param  {string}   body [page body]
     * @param  {json}   data [queue data]
     * @param  {Function} cb   [function]
     * @return {function}    [cb]
     */
    work(body, data, cb){
        const $ = Cheerio.load(body);

        return cb(this.matchTargets($, this.createTargetRegex(data.targets)));
    }
    /**
     * [createTargetRegex method]
     * @param  {[type]} masters [array]
     * @return {[master_regex]}         [function]
     */
    createTargetRegex(masters) {
        let term = "", master= "", master_regex = "";

        for (master in masters) {
            if (masters.hasOwnProperty(master)) {
                term = masters[master];
                master_regex += 'a[href^="' + term + '"],';
            }
        }

        // drops trailing ,
        return master_regex.slice(0, -1);
    }
    /**
     * [matchTargets matchTargets]
     * @param  {[class]} $      [cheerio]
     * @param  {[type]} masters [array]
     * @return {[array]}        [targets]
     */
    matchTargets($, masters) {
        const self = this;
        let j = 0;

        return $(masters).map(function (i, el) {
            j++;
            self.matched++;
            return {
                "href": $(this).attr('href'),
                "anchor": $(this).html()
            };
        });
    }
}

module.exports = Backlinks;
