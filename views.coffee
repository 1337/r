define ['jquery', 'underscore', 'marionette', 'Models', 'imagesloaded'], ($, _, Marionette, Models, imagesLoaded) ->

    Views = {}
    $window = $(window)
    $document = $(document, $window)
    settings = Models.settings

    safeText = (text="") ->
        text = text.replace(/<!--\w+-->/, '')
        el = $('<div />').html(text)
        $(el).text()


    imgurProcessor = (url) ->
        if url.indexOf('imgur') <= -1
            return url

        url = url.replace('i.imgur', 'imgur').replace('imgur', 'i.imgur')

        # console.debug url
        if settings.get('autoload')
            if url.substr(-5) == ".gifv"
                url = url[..-2]
        else
            if url.substr(-5) == ".gifv"
                url = url[..-6] + 'h.jpg'

        extension = /(gif|jpe?g|png)$/i
        unless extension.exec(url)
            if settings.get('autoload')
                url += '.jpg'  # autoprefixer for imgur links
            else
                url += "h.jpg"  # 'h' becomes thumbnail

        unless settings.get('autoload')
            url = url.replace(/\.gif$/, 'h.jpg')

        # console.debug url
        url


    gftcatProcessor = (url) ->
        if url.indexOf('gfycat') is -1
            return url
        # https://www.reddit.com/r/gfycat/comments/1zjnqt/getting_thumbnails_from_gfys/
        url.replace /-100.jpg/g, '-poster.jpg'


    # Given html, find links to images and turn them into image tags
    expandImages = (html) ->
        html = html.replace(/gifv/, 'gif')
        html.replace(
            /<a href="([^'"]+\.(jpe?g|gifv?|png)[^'"]*)">([^&<]+)<\/a>/ig,
            """
                <div class="comment-image">
                    <a href="$1" target="_blank">$3</a>
                    <img src="$1" />
                </div>
            """)


    class Views.CommentsView extends Marionette.CollectionView
        template: "#comments_template"
        collection: null
        childView: class extends Marionette.LayoutView
            template: "#comment_template"
            className: "reply"
            regions:
                replies: '.replies'

            templateHelpers:
                body: ->
                    # pre (post?) process the reddit comment
                    body = safeText(@body_html)
                    if settings.get('autoload')
                        expandImages(body)
                    else
                        body

            onShow: ->
                _.defer =>
                    # don't piss users off
                    links = @$('a')
                    links.prop('target', '_blank')

                    # Handle relative subreddit links
                    links.each (idx, el) ->
                        $el = $(el)
                        href = $el.attr('href')
                        if href.indexOf('/r/') == 0
                            $el.attr 'href', '#' + href[2..]
                            # let the link open same tab
                            $el.removeAttr('target')

                    # Traverse up, find OP's name, and highlight if applicable.
                    $post = @$el.parents('.post')
                    op = $.trim($post.find('.author:first').text())
                    if @model.get('author') == op
                        @$el.addClass('op')

                hasReplies = @model.get('replies')?.data?.children?.length
                unless hasReplies and (hasReplies >= 1)
                    return
                firstChild = @model.get('replies').data.children[0]
                if firstChild.kind is 'more'
                    return

                filteredComments = Models.filterScore([firstChild])
                replies = new Models.Comments(filteredComments)
                repliesView = new Views.CommentsView(collection: replies)
                if @model.get('gilded')
                    @$el.addClass('gilded')
                @replies?.show(repliesView)

        initialize: (options={}) ->
            @collection = options.collection
            @collection.fetch()

        # Make masonry layout whenever a new post is added
        attachHtml: (collectionView, childView, index) ->
            itemAdded = =>
                collectionView.$el.append(childView.el)

            if childView.$('img')?.length
                il = imagesLoaded(childView.$el)
                il?.on 'always', (instance) =>
                    itemAdded()
            else
                itemAdded()


    class Views.MenuView extends Marionette.LayoutView
        template: '#menu_template'
        events:
            "click .navbar-toggle": ->
                App?.commands.execute("toggleMenu")


    class Views.PostView extends Marionette.LayoutView
        className: 'post'
        template: '#post_template'
        regions:
            comments: '.comments'
        events:
            'click *': ->
                App?.commands.execute("toggleMenu", false)

        templateHelpers:
            unescape: safeText
            thumb: ->
                # http://marionettejs.com/docs/v2.3.2/marionette.view.html#accessing-data-within-the-helpers
                if @url.indexOf('imgur') > -1
                    return imgurProcessor(@url)

                url = @media?.oembed?.thumbnail_url
                if url
                    url = gftcatProcessor(url)
                if url
                    return url

                url = @thumbnail
                if url is 'self'
                    return ''
                else
                    return url
        onShow: ->
            if settings.get('showcomments', true)
                replies = new Models.Comments([], {
                    permalink: @model.get('permalink')
                })
                commentsView = new Views.CommentsView
                    collection: replies
                if @model.get('gilded')
                    @$el.addClass('gilded')
                id = requestAnimationFrame =>
                    @getRegion('comments').show(commentsView)
                    cancelAnimationFrame id

            # Keep reference of itself on the element
            @$el.data('view', this)


    class Views.ContentView extends Marionette.CompositeView
        template: '#content_template'
        childView: Views.PostView
        childViewContainer: ".posts"

        attachHtml: (collectionView, childView, index) ->
            # Make masonry layout whenever a new post is added
            itemAdded = =>
                collectionView.$el.append(childView.el)

            if childView.$('img')?.length
                il = imagesLoaded(childView.$el)
                il?.on 'always', (instance) =>
                    itemAdded()
            else # no images in the box
                _.defer =>
                    itemAdded()


    class Views.HistoryView extends Marionette.CollectionView
        childView: class extends Marionette.ItemView
            template: '#history_template'
            tagName: 'li'
        tagName: 'ul'
        className: 'sidebar-nav'


    class Views.SettingsView extends Marionette.LayoutView
        template: '#settings_template'
        className: 'container'
        ui:
            'minscore': '#minscore'
            'autoload': '#autoload'
            'nightmode': '#nightmode'
            'preloadpages': '#preloadpages'
            'showcomments': '#showcomments'

        onShow: ->
            App.commands.execute('updateTitle', 'Settings')

            @ui.minscore.val(
                settings.get('minscore', 20))
            @ui.preloadpages.val(
                settings.get('preloadpages', 4))
            @ui.autoload.attr('checked',
                settings.get('autoload', false))
            @ui.nightmode.attr('checked',
                settings.get('nightmode', false))
            @ui.showcomments.attr('checked',
                settings.get('showcomments', true))
        events:
            'click .save': (e) ->
                e.preventDefault()
                settings.set 'minscore', @ui.minscore.val()
                settings.set 'preloadpages', @ui.preloadpages.val()
                settings.set 'autoload', @ui.autoload.prop('checked')
                settings.set 'nightmode', @ui.nightmode.prop('checked')
                settings.set 'showcomments', @ui.showcomments.prop('checked')

                window.location.reload()

    Views