define ['jquery', 'underscore', 'backbone', 'marionette'], ($, _, Backbone, Marionette) ->

    Models = {}


    class Settings
        get: (key, defaultValue) ->
            thing = localStorage.getItem(key)
            if (not thing) and defaultValue isnt undefined
                return defaultValue
            try
                return JSON.parse(thing)
            catch e
                return thing

        set: (key, value) ->
            localStorage.setItem(key, JSON.stringify(value))

        remove: (key) ->
            localStorage.removeItem(key)

    settings = Models.settings = new Settings()


    # Remove low score comments
    Models.filterScore = (comments=[], min) ->
        if min == -1
            # Do not filter
            return comments
        else if min is undefined
            min = settings.get('minscore', 20)
        return _.compact(_.map((comments), (item) ->
            if item?.data?.score >= min
                return item
            return undefined
        ))


    # Read only by restricting all calls to 'read'
    class Models.ReadOnlyModel extends Backbone.Model
        sync: (method, rest...) ->
            Backbone.sync('read', rest...)


    class Models.Post extends Models.ReadOnlyModel


    class Models.Comment extends Models.ReadOnlyModel
        replies: ->
            comments = @get('replies')?.data?.children
            Models.Comments(Models.filterScore(comments))


    class Models.Comments extends Backbone.Collection
        # Model for the Feed
        permalink: null

        initialize: (models, options={}) ->
            @permalink = options.permalink || ''

        url: ->
            url = "http://www.reddit.com#{@permalink}.json?jsonp=?"

        model: (attrs, options) ->
            # A collection can also contain polymorphic models by overriding
            # this property with a constructor that returns a model.
            if attrs.kind and attrs.data  # strip reddit's wrapper
                return new Models.Comment(attrs.data, options)

            new Models.Comment(attrs, options)

        fetch: (options={}) ->
            dfr = new $.Deferred()
            _.extend options,
                cache: true
                timeout: 15000

            # console.debug "fetching comments #{@permalink}"
            if not @permalink
                _.defer(->
                    dfr.resolve([]))
                return dfr.promise()

            Backbone.Collection::fetch.call(@, options)
                .done (data) =>
                    dfr.resolve(data)

            dfr.promise()

        parse: (resp) ->  # tame reddit's lame json format
            root = resp
            if resp.length
                root = resp[1]  # for a direct GET, [0] is the actual post

            # it is always one of those
            comments = root?.data?.children or root?.data?.replies
            comments = Models.filterScore(comments)

            # here's me not giving a flying fuck
            _.sortBy(comments, ((c) -> 1e5 - c.data.score))


    # Model for the Feed
    class Models.Listing extends Backbone.Collection
        initialize: (models, options={}) ->
            console.debug "Listing initialized with #{options.subreddits}"
            @subreddits = options.subreddits

        model: (attrs, options) ->
            # A collection can also contain polymorphic models by overriding
            # this property with a constructor that returns a model.
            new Models.Post(attrs, options)

        url: ->
            if @subreddits == 'mine'
                url = "http://www.reddit.com/.json?jsonp=?"
            else
                url = "http://www.reddit.com/r/#{@subreddits}/.json?jsonp=?"

            if window.lastPostId
                url += '&after=' + window.lastPostId

            url

        fetch: (options={}) ->
            dfr = new $.Deferred()
            _.extend options,
                add: true
                merge: true  # dedupe?
                remove: false
                reset: false
                cache: true
                timeout: 30000

            # console.debug "fetching listing #{@subreddits}"
            Backbone.Collection::fetch.call(@, options)
                .done dfr.resolve
                .fail (reason) ->
                    dfr.resolve([])

            dfr.promise()

        parse: (resp) ->  # tame reddit's lame json format
            posts = _.pluck(Models.filterScore(resp?.data?.children), 'data')

            if resp?.data?.after
                window.lastPostId = resp?.data?.after
            else
                window.lastPostId = _.last(posts).id

            # You know what this does.
            _.each posts, (post) ->
                if post.subreddit == 'unexpectedjihad'
                    post.subreddit = 'videos'
                    post.score = parseInt(post.score, 10) * 10
            posts

    Models