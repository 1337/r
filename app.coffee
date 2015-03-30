define ['jquery', 'underscore', 'backbone', 'marionette', 'Models', 'Views', 'Controllers'], ($, _, Backbone, Marionette, Models, Views, Controllers) ->

    $window = $(window)
    $document = $(document, $window)
    settings = Models.settings


    # Prevent duplicate apps
    app = new class extends Marionette.Application
        initialize: (options) ->
        regions:
            content: '.content'
            history: '.subreddit-history'
            menu: '.menu'
            related: '.related'
            sidebar: '#sidebar-wrapper'


    class AppRouter extends Marionette.AppRouter
        appRoutes:
            "": "home"
            "settings": "settings"
            ":sub" : "sub"
            ":sub/comments/:id" : "comments"


    class RouteController extends Marionette.Controller
        home: ->
            showSubreddit "all"
        sub: (sub) ->
            if sub == 'settings'  # :(
                showSettings()
            else
                console.debug "selected sub: #{sub}"
                showSubreddit sub
        comments: ->
            console.log "comments"
        settings: ->
            showSettings()


    setNightMode = (bool) ->
        if bool is undefined
            bool = Boolean(settings.get('nightmode'))
        for stylesheet in document.styleSheets
            if stylesheet.href and stylesheet.href.indexOf('-dark') > -1
                stylesheet.disabled = not bool


    updateTitle = (title='') ->
        document.title = title
        model = new Backbone.Model(title: title.replace('/r/', ''))
        app.menu.show(new Views.MenuView(model: model))
    app.commands.setHandler("updateTitle", updateTitle)


    updateMenu = ->
        pastSubs = Controllers.getHistory()
        app.history.show(
            new Views.HistoryView(
                collection: new Backbone.Collection(pastSubs)))


    toggleMenu = (bool) ->
        menu = $("#wrapper", $document)
        if bool is undefined
            menu.toggleClass("toggled")
        else
            menu.toggleClass("toggled", bool)
    app.commands.setHandler("toggleMenu", toggleMenu)


    hideObjectsOutOfViewport = (selector='.post') ->
        $posts = $(selector)
        $posts.css(visibility: 'hidden')
        $("#{selector}:in-viewport").removeStyle('visibility')
        $("#{selector}:in-viewport:last").next()?.removeStyle('visibility')


    showSubreddit = (sub='funny') ->
        # Save the name of whatever requested.
        Controllers.addHistory(sub, sub)

        toggleMenu(false)
        updateTitle "/r/#{sub}"
        updateMenu()

        # Display first 5 related subs in the sidebar
        relatedSubs = Controllers.getRelatedSubs(sub, 5)
        relatedSubs = _.sortBy(relatedSubs, 'sub')
        app.related.show(
            new Views.HistoryView(
                collection: new Backbone.Collection(relatedSubs)))

        # assume the category has changed.
        window.lastPostId = null

        collection = new Models.Listing([], subreddits: sub)

        app.content.show(new Views.ContentView(collection: collection))
        collection.fetch()
    app.commands.setHandler("showSubreddit", showSubreddit)


    showSettings = ->
        toggleMenu(false)
        document.title = 'Settings'
        app.content.show(new Views.SettingsView)


    redirectToHashUrl = ->
        # Wrong url mate
        exp = /\/r\/([a-z+_]+)/.exec(window.location.pathname)
        if not exp
            return
        subs = exp[1]  # 'gifs' in '/r/gifs'
        try
            window.history.replaceState({}, '', "/r/#/#{subs}")
        catch e
            window.location.assign window.location.href.replace("/r/", "/r/#")

    app.on 'start', ->
        redirectToHashUrl()
        setNightMode()
        updateTitle()
        updateMenu()

    # Route paths using Backbone history.
    # http://stackoverflow.com/a/25337481
    app.on "start", ->
        router = new AppRouter
            controller : new RouteController()
        unless Backbone.history
            console.error "Backbone.history not found!"
            return
        Backbone.history.start()


    # Infinite scrolling
    app.on "start", ->
        preloadPages = settings.get('preloadpages', 4)
        requiredBTF = window.innerHeight * preloadPages
        $window.scrollStopped ->
            if settings.get('autoload')
                hideObjectsOutOfViewport('img')

            currentY = window.innerHeight + window.scrollY
            if $document.height() - currentY < requiredBTF
                # Fetch only if the view has a collection attached
                app.content.currentView?.collection?.fetch()

            # Show current post title
            currentPost = $('.post:in-viewport:first')
            model = currentPost?.data('view')?.model
            if model and model.get('subreddit') and model.get('title')
                updateTitle(model.get('subreddit') + ': ' + model.get('title'))

    # Other events
    $('.clear', $document).on 'click', ->
        if confirm('Clear the list of subreddits?')
            settings.remove('pastSubs')
            window.location.reload()

    $('.next-post', $document).on 'click', ->
        try
            scrollTop = $('.post:below-the-fold').first().offset().top - 60
            $window.scrollTop(scrollTop)
        catch e  # :(
            console.error e

    $('.read-post', $document).on 'click', ->
        scrollTop = $window.scrollTop()
        posts = []
        $('.post').each (idx, post) ->
            post = $(post)
            if scrollTop >= post.offset().top
                posts.push post

        for post in posts
            try
                # Use marionette's method where possible
                post.data('view').destroy()
            catch err
                console.debug "eck! #{err}"
                post.remove()

        $window.scrollTop(0)

    return app