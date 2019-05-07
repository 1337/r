/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require.config({
  baseUrl: 'js/',
  paths: {
    'app': 'app',
    'Models': 'models',
    'Views': 'views',
    'Controllers': 'controllers',
    'reddit_related': 'reddit_related',
    'backbone': [
      '../lib/backbone/backbone',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min'
    ],
    'bootstrap': [
      '../lib/bootstrap/dist/js/bootstrap.min',
      'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/js/bootstrap.min'
    ],
    'bootstrap-material-design': [
      '../lib/bootstrap-material-design/dist/js/material.min',
      'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.3.0/js/material.min'
    ],
    'chance': 'chance/chance',
    'eventemitter': [
      '../lib/eventEmitter/EventEmitter.min',
      'https://cdnjs.cloudflare.com/ajax/libs/EventEmitter/4.2.11/EventEmitter.min'
    ],
    'eventie': '../lib/eventie/eventie',
    'imagesloaded': [
      '../lib/imagesloaded/imagesloaded.pkgd'
    ],
    'jquery': [
      '../lib/jquery/dist/jquery.min',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min'
    ],
    'jquery-removestyle': 'jquery.removestyle',
    'jquery-scrollstopped': 'jquery.scrollstopped',
    'jquery-scrolltop': 'jquery.scrolltop',
    'jquery-touchswipe': [
      '../lib/jquery.touchswipe',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.4/jquery.touchSwipe.min'
    ],
    'jquery-viewport': 'jquery.viewport.min',
    'marionette': [
      '../lib/marionette/lib/backbone.marionette',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.3.2/backbone.marionette.min'
    ],
    'masonry': [
      '../lib/masonry/dist/masonry.pkgd.min',
      'https://cdnjs.cloudflare.com/ajax/libs/masonry/3.3.0/masonry.pkgd.min'
    ],
    'modernizr': [
      '../lib/modernizr/modernizr',
      'https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min'
    ],
    'underscore': [
      '../lib/underscore/underscore',
      'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min'
    ],
    'underscore-mixins': 'underscore.mixins',
    'uri': 'uri'
  },
  shim: {
    'app': {
      deps: [
        'modernizr',
        'uri',
        'jquery-viewport', 'jquery-removestyle', 'jquery-scrollstopped',
        'jquery-scrolltop',
        'reddit_related', 'underscore-mixins'
      ]
    },
    'backbone': {
      deps: ['underscore'],
      exports: 'Backbone'
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'bootstrap-material-design': {
      deps: ['jquery', 'bootstrap']
    },
    'imagesloaded': {
      deps: ['eventie', 'eventemitter'],
      exports: 'imagesLoaded'
    },
    'jquery-removestyle': {
      deps: ['jquery']
    },
    'jquery-scrollstopped': {
      deps: ['jquery']
    },
    'jquery-scrolltop': {
      deps: ['jquery']
    },
    'jquery-touchswipe': {
      deps: ['jquery']
    },
    'jquery-viewport': {
      deps: ['jquery']
    },
    'marionette': {
      deps: ['backbone'],
      exports: 'Marionette'
    },
    'masonry': {
      exports: 'Masonry'
    },
    'underscore': {
      exports: '_'
    },
    'underscore-mixins': {
      deps: ['underscore']
    },
    'uri': {
      exports: 'urlparse',
      deps: ['jquery']
    }
  }
});

// start the app
require(['jquery', 'app'], ($, App) =>
  $(() => (window.App = App).start())
);
