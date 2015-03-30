require = top.require || null

require.config
    baseUrl: '/static/js'
    paths:
        'app': '../../r/app'
        'Models': '../../r/models'
        'Views': '../../r/views'
        'Controllers': '../../r/controllers'

        'reddit_related': '/r/reddit_related'

        'backbone': 'backbone/backbone'
        'bootstrap': 'bootstrap/dist/js/bootstrap.min'
        'bootstrap-material-design': 'bootstrap-material-design/dist/js/material.min'
        'eventemitter': 'eventEmitter/EventEmitter.min'
        'eventie': 'eventie/eventie'
        'imagesloaded': 'imagesloaded/imagesloaded.pkgd'
        'jquery': 'jquery/dist/jquery.min'
        'jquery-removestyle': 'jquery.removestyle'
        'jquery-scrollstopped': 'jquery.scrollstopped'
        'jquery-touchswipe': 'jquery.touchswipe'
        'jquery-viewport': 'jquery.viewport.min'
        'marionette': 'marionette/lib/backbone.marionette'
        'masonry': 'masonry/dist/masonry.pkgd.min'
        'modernizr': 'modernizr/modernizr'
        'requestanimationframe': 'requestanimationframe'
        'underscore': 'underscore/underscore'
        'underscore-mixins': 'underscore.mixins'
        'uri': 'uri'

    shim:
        'app':
            deps: [
                'modernizr',
                'bootstrap', 'bootstrap-material-design', 'uri', 'requestanimationframe',
                'jquery-viewport', 'jquery-removestyle', 'jquery-scrollstopped',
                'reddit_related', 'underscore-mixins'
            ]
        'backbone':
            deps: ['underscore']
            exports: 'Backbone'
        'bootstrap':
            deps: ['jquery']
        'bootstrap-material-design':
            deps: ['jquery', 'bootstrap']
        'imagesloaded':
            deps: ['eventie', 'eventemitter']
            exports: 'imagesLoaded'
        'jquery-removestyle':
            deps: ['jquery']
        'jquery-scrollstopped':
            deps: ['jquery']
        'jquery-touchswipe':
            deps: ['jquery']
        'jquery-viewport':
            deps: ['jquery']
        'marionette':
            deps: ['backbone']
            exports: 'Marionette'
        'masonry':
            exports: 'Masonry'
        'underscore':
            exports: '_'
        'underscore-mixins':
            deps: ['underscore']
        'uri':
            exports: 'urlparse'
            deps: ['jquery']

# start the app
require ['jquery', 'bootstrap-material-design', 'app'], ($, eh, App) ->
    $ ->
        $.material.init()
        (window.App = App).start()