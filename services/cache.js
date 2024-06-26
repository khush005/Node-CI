const mongoose = require('mongoose');
const redis = require("redis");
const util = require("util");
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        return exec.apply(this, arguments);       
    }
    console.log('IM ABOUT TO RUN A QUERY');

    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

    // See if we have a value for 'key' in redis
    const cacheValue = await client.hget(this.hashKey, key);

    // If we do, return that
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);    
        
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);

        // return doc;

        // return JSON.parse(cacheValue);

        // new Blog({
        //     title: 'New Blog 2',
        //     content: 'hey!'
        // })
    }

    // Otherwise, issue the query & store the result in redis
    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result;

    // console.log(key);
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}