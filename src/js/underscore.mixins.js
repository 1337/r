_.mixin({
    /**
     * Run a list of functions one after another.
     *
     * Example
     * _.seq([function (a) { console.log(a); return 'bar';},
     *        function (b) { console.log(b); return 'baz';},
     *        function (c) { console.log(c);}
     *  ])('foo')
     *
     * > foo
     * > bar
     * > baz
     *
     * @return {function} that accepts arguments for the first function
     */
    'seq': function (fns) {
        "use strict";
        var self = this;

        return function (args) {
            var i, args_ = args;
            for (i = 0; i < fns.length; i++) {
                args_ = fns[i].apply(self, [args_]);
            }
            return args_;
        };
    },
    /**
     * from obj, traverse down paths and return its value, or defaultValue.
     *
     * @param {Object|undefined}  obj
     * @param {Array}   paths
     * @param {*}       defaultValue
     */
    'get': function (obj, paths, defaultValue) {
        "use strict";
        var i, obj_ = obj;
        try {
            for (i = 0; i < paths.length; i++) {
                obj_ = obj_[paths[i]];
            }
            if (obj_ === undefined) {
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
        return obj_;
    },
    /**
     * Returns the sum of an array.
     *
     * @param {Array} obj
     * @returns {Number|String}
     */
    'sum': function (obj) {
        "use strict";
        return _.reduce(obj, function (a, b) {
            return a + b;
        });
    },
    /**
     * Returns the average of an array.
     *
     * @param {Array} obj
     * @returns {Number}
     */
    'average': function (obj) {
        "use strict";
        return _.sum(obj) / obj.length;
    },
    /**
     * Returns whether all items are tru-ey.
     *
     * @param {Array} obj
     * @returns {Boolean}
     */
    'all': function (obj) {
        "use strict";
        return Boolean(_.reduce(obj, function (a, b) {
            return a && b;
        }));
    },
    /**
     * Returns whether any item in obj is tru-ey.
     * EDIT: wait, _.some is already _.any
     * @param {Array} obj
     * @returns {Boolean}
     */
    /*'any': function (obj) {
        "use strict";
        return Boolean(_.reduce(obj, function (a, b) {
            return a || b;
        }));
    },*/
    'keyLen': function (obj) {
        "use strict";
        return Object.keys(obj).length;
    },
    /**
     * WARNING: as it is, this function removes all delimiters inside
     * the string, not just from left to right.
     *
     * @param str (String}
     * @param delimiters {Array}
     * @returns {String}
     */
    'trim': function (str, delimiters) {
        "use strict";
        if (!str) {
            return '';
        }
        return _.filter(str.split(''), function (v) {
            return v.length > 0 && _.all(delimiters, function (delimiter) {
                return v.indexOf(delimiter) === -1;
            });
        }).join('');
    }
});