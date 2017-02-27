const bs = require('nodestalker'),
    client = bs.Client('127.0.0.1:11300');

function serialize(obj) {
   var serialized = {};

   for(var prop in obj) {
        if (obj.hasOwnProperty(prop) && typeof obj[prop] == 'function') {
           if (/^get.*/.test(prop)) {
               var value = obj[prop]();
               var name = prop.replace('get', '');

               if (typeof value === 'object') {
                   serialized[name] = this.serialize(value);
                   continue;
               }

               serialized[name] = value;
           }
       }
   }

   return serialized;
};

function Tester () {

}

Tester.prototype.printhello = function() {
    "use strict";
    console.log("hello");
}

var test = new Tester();
var test_data = serialize(test);


client.use('obj').onSuccess(function (data) {

    client.put(JSON.stringify(test_data)).onSuccess(function (data) {
        console.log(data);
    });
});

setTimeout(function () {
    client.disconnect();
}, 2000);