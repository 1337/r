(function (root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.urlparse = factory(root.urlparse);
    }
}(this, function (urlparse) {
    //use b in some fashion.
    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    var me = urlparse || {};

    me.all = function () {
        var i,
            kv = {},
            pair,
            query = window.location.search.substring(1),
            vars = query.split('&');
        for (i = 0; i < vars.length; i++) {
            pair = vars[i].split('=');
            kv[pair[0]] = pair[1];
        }
        return kv;
    };

    me.get = function (variable) {
        return me.all()[variable];
    };

    me.getBool = function (variable) {
        return Boolean(me.get(variable));
    };

    me.getNumber = function (variable) {
        return Number(me.get(variable));
    };

    return me;
}));