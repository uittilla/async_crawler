/* jslint -W033, -W097, -W117, -W104 */
'use strict';

const Cheerio = require('cheerio');
const debug   = require('debug')('Youtube');
const Config  = require('../config.json');
/**
 *  Grabs links from a confluence search
 */
class Youtube {
    /**
     * [constructor Confluence]
     * @return {null} 
     */
    constructor() { }
    /**
     * [work fumethod]
     * @param  {string}    body [html]
     * @param  {json}      data [queue]
     * @param  {Function}  cb   [callback]
     * @return {function}       [cb]
     */
    work(body, data, cb) {
        debug('working');
        const  $ = Cheerio.load(body);
       // debug('page', body);
        setTimeout(function(){

            let comment = $(Config.selectors.youtube_links).map(function (i, el) {
                debug("here", i, el);
                return $(this).html();
            });

            debug("comments", comment);

            return cb(comment);
        }, 4000);
    }
}

module.exports = Youtube;
