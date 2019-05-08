/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore';
import Models from './models';


const Controllers = {};
const { settings } = Models;


Controllers.getHistory = function() {
    try {
        return settings.get('pastSubs', []) || [];
    } catch (e) {
        return [];
    }
};


Controllers.addHistory = function(subName, subLink) {
    let needle;
    const currentHistory = Controllers.getHistory();

    // Turn all sub names into lower case for checking
    const subs = _.map(_.pluck(currentHistory, 'sub'), thing => thing.toLowerCase());
    if ((needle = subName.toLowerCase(), Array.from(subs).includes(needle))) {
        // Sub already in history.
        const index = subs.indexOf(subName.toLowerCase());
        currentHistory.splice(index, 1);
    }

    currentHistory.unshift({sub: subName, link: subLink});
    settings.set('pastSubs', currentHistory);

    return currentHistory;
};


Controllers.getRelatedSubs = function(sub, count) {
    if (count == null) { count = 0; }
    const cluster = window.redditMarkovClusters;
    if (!cluster || !cluster[sub]) {
        return [];
    }

    const clusterId = cluster[sub];  // e.g. 1

    const keysInCluster = [];
    _.each(cluster, function(val, key) {
        if (val === clusterId) {
            return keysInCluster.push(key);
        }
    });

    // Transform into {"sub": ..., "link": ...}
    const res = [];
    _.each(keysInCluster, function(val) {
        if (val !== sub) {
            return res.push({sub: val, link: val});
        }
    });

    if (count === 0) {
        return res;
    } else {
        return res.slice(0, +(count-1) + 1 || undefined);
    }
};

export default Controllers;