/* jslint -W033, -W097, -W117, -W104, -W119 */
"use strict";

/**
 * @Purpose: Wrap Beanstalk in emmiters
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson>
 * @type {*}
 */
const Beanstalk = require('nodestalker');
const Event     = require('events').EventEmitter;
const Util      = require('util');

/**
 *
 * @type {
 *  {
 *    __proto__: event,
 *    tube: null,
 *    init:, getJob:, watchTube:, reserveJob:, deleteJob:, disconnect: Function
 *    }
 *  }
 */
class Queue extends Event{
    /**
     * [constructor Queue]
     * @param  {[type]} tube [Queue tube]
     */
    constructor(tube) {
        super();
        this._tube = tube;
        this._client = Beanstalk.Client();
    }
    /**
     * Entry point
     */
    getJob() {
        this.watchTube();
    }
    /**
     * Call watch
     */
    watchTube() {
        let self = this;
        this._client.watch(this._tube).onSuccess(function(data) {
            self.reserveJob();
        });
    }
    /**
     * Call watch
     */
    watch(cb) {
        let self = this;
        this._client.watch(this._tube).onSuccess(function(data) {
            return cb(data);
        });
    }
    /**
     * Call reserve
     */
    reserveJob() {
        let self = this;
        this._client.reserveWithTimeout(120).onSuccess(function(job) {
            return self.emit('jobReady', job);
        }).onError(function(err) {
            self.emit('noJobs');
        });
    }
    /**
     * Delete job
     * @param id
     * @param crawler
     */
    deleteJob(id, crawler) {
        let self = this;
        this._client.deleteJob(id).onSuccess(function(del_msg) {
            return self.emit('jobDeleted', id, del_msg, crawler);
        }).onError(function(err) {
            Util.log("Cannot delete", id, err);
        });

        Util.log("Delete called for ", id);
    }
    /**
     * Tube stats
     * @param cb
     */
    statsTube(cb) {
        let self = this;
        this._client.stats_tube(this._tube).onSuccess(function(data) {
            return cb(data);
        }).onError(function(err) {
            Util.log("Unable to stats tube");
        });
    }
    /**
     * Kill the connection
     */
    disconnect() {
        this._client.disconnect();
    }
}

module.exports = Queue;
