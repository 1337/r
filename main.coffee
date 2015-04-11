require = top.require || null

require.config
    baseUrl: '/static/js'
    paths:
        'app': '../../r/app',
        'Models': '../../r/models',
        'Views': '../../r/views',
        'Controllers': '../../r/controllers',
        'reddit_related': '/r/reddit_related',
        'backbone': [
            'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
            'backbone/backbone'
        ],
        'bootstrap': [
            'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/js/bootstrap.min',
            'bootstrap/dist/js/bootstrap.min'
        ],
        'bootstrap-material-design': [
            'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.3.0/js/material.min',
            'bootstrap-material-design/dist/js/material.min'
        ],
        'chance': 'chance/chance'
        'eventemitter': [
            'https://cdnjs.cloudflare.com/ajax/libs/EventEmitter/4.2.11/EventEmitter.min',
            'eventEmitter/EventEmitter.min'
        ],
        'eventie': 'eventie/eventie',
        'imagesloaded': [
            # 'https://cdn.jsdelivr.net/imagesloaded/3.1.6/imagesloaded.min',
            'imagesloaded/imagesloaded.pkgd'
        ],
        'jquery': [
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min',
            'jquery/dist/jquery.min'
        ],
        'jquery-removestyle': 'jquery.removestyle',
        'jquery-scrollstopped': 'jquery.scrollstopped',
        'jquery-scrolltop': 'jquery.scrolltop',
        'jquery-touchswipe': [
            'https://cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.4/jquery.touchSwipe.min',
            'jquery.touchswipe'
        ],
        'jquery-viewport': 'jquery.viewport.min',
        'marionette': [
            'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.3.2/backbone.marionette.min',
            'marionette/lib/backbone.marionette'
        ],
        'masonry': [
            'https://cdnjs.cloudflare.com/ajax/libs/masonry/3.3.0/masonry.pkgd.min',
            'masonry/dist/masonry.pkgd.min'
        ],
        'modernizr': [
            'https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min',
            'modernizr/modernizr'
        ],
        'requestanimationframe': 'requestanimationframe',
        'underscore': [
            'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
            'underscore/underscore'
        ],
        'underscore-mixins': 'underscore.mixins',
        'uri': 'uri'
    shim:
        'app':
            deps: [
                'modernizr',
                'bootstrap', 'uri', 'requestanimationframe',
                'jquery-viewport', 'jquery-removestyle', 'jquery-scrollstopped',
                'jquery-scrolltop',
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
        'jquery-scrolltop':
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
require ['jquery', 'app'], ($, App) ->
    $ ->
        (window.App = App).start()