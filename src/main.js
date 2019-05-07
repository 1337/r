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
      '../../node_modules/backbone/backbone'
    ],
    'bootstrap': [
      '../../node_modules/bootstrap/dist/js/bootstrap.min'
    ],
    'bootstrap-material-design': [
      '../../node_modules/bootstrap-material-design/dist/js/material.min'
    ],
    'chance': 'chance/chance',
    'eventemitter': [
      '../../node_modules/eventEmitter/EventEmitter.min'
    ],
    'eventie': '../../node_modules/eventie/eventie',
    'imagesloaded': [
      '../../node_modules/imagesloaded/imagesloaded.pkgd'
    ],
    'jquery': [
      '../../node_modules/jquery/dist/jquery'
    ],
    'jquery-removestyle': 'jquery.removestyle',
    'jquery-scrollstopped': 'jquery.scrollstopped',
    'jquery-scrolltop': 'jquery.scrolltop',
    'jquery-touchswipe': [
      '../../node_modules/jquery.touchswipe'
    ],
    'jquery-viewport': 'jquery.viewport.min',
    'marionette': [
      '../../node_modules/backbone.marionette/lib/backbone.marionette'
    ],
    'masonry': [
      '../../node_modules/masonry/dist/masonry.pkgd.min'
    ],
    'underscore': [
      '../../node_modules/underscore/underscore'
    ],
    'underscore-mixins': 'underscore.mixins',
    'uri': 'uri'
  },
  shim: {
    'app': {
      deps: [
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
      // deps: ['eventie', 'eventemitter'],
      deps: ['eventie'],
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
