define ['jquery', 'underscore', 'backbone', 'marionette', 'Models'], ($, _, Backbone, Marionette, Models) ->

    Controllers = {}
    settings = Models.settings


    Controllers.getHistory = ->
        try
            settings.get('pastSubs', []) or []
        catch e
            []


    Controllers.addHistory = (subName, subLink) ->
        currentHistory = Controllers.getHistory()

        # Turn all sub names into lower case for checking
        subs = _.map(_.pluck(currentHistory, 'sub'), (thing) -> thing.toLowerCase())
        if subName.toLowerCase() in subs
            # Sub already in history.
            index = subs.indexOf subName.toLowerCase()
            currentHistory.splice(index, 1)

        currentHistory.unshift({sub: subName, link: subLink})
        settings.set('pastSubs', currentHistory)

        currentHistory


    Controllers.getRelatedSubs = (sub, count=0) ->
        cluster = window.redditMarkovClusters
        unless cluster and cluster[sub]
            return []

        clusterId = cluster[sub]  # e.g. 1

        keysInCluster = []
        _.each cluster, (val, key) ->
            if val is clusterId
                keysInCluster.push key

        # Transform into {"sub": ..., "link": ...}
        res = []
        _.each keysInCluster, (val) ->
            if val isnt sub
                res.push {sub: val, link: val}

        if count is 0
            return res
        else
            return res[..count-1]


    Controllers
