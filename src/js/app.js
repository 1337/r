/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Models from './models';
import Views from './views';
import Controllers from './controllers';

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}


const $window = $(window);
const $document = $(document, $window);
const {settings} = Models;


// Prevent duplicate apps
const app = new ((function () {
  const Cls = class extends Marionette.Application {
    static initClass() {
      this.prototype.regions = {
        content: '.content',
        history: '.subreddit-history',
        menu: '.menu',
        related: '.related',
        sidebar: '#sidebar-wrapper'
      };
    }

    initialize(options) {
    }
  };
  Cls.initClass();
  return Cls;
})());


class AppRouter extends Marionette.AppRouter {
  static initClass() {
    this.prototype.appRoutes = {
      "": "home",
      "settings": "settings",
      ":sub": "sub",
      ":sub/comments/:id": "comments"
    };
  }
}

AppRouter.initClass();


class RouteController extends Marionette.Controller {
  home() {
    return showSubreddit("all");
  }

  sub(sub) {
    if (sub === 'settings') {  // :(
      return showSettings();
    } else {
      console.debug(`selected sub: ${sub}`);
      return showSubreddit(sub);
    }
  }

  comments() {
    return console.log("comments");
  }

  settings() {
    return showSettings();
  }
}


const setNightMode = function (bool) {
  if (bool === undefined) {
    bool = Boolean(settings.get('nightmode'));
  }
  return (() => {
    const result = [];
    for (let stylesheet of Array.from(document.styleSheets)) {
      if (stylesheet.href && (stylesheet.href.indexOf('-dark') > -1)) {
        result.push(stylesheet.disabled = !bool);
      } else {
        result.push(undefined);
      }
    }
    return result;
  })();
};


const updateTitle = function (title) {
  if (title == null) {
    title = '';
  }
  document.title = title;
  const model = new Backbone.Model({title: title.replace('/r/', '')});
  return app.menu.show(new Views.MenuView({model}));
};
app.commands.setHandler("updateTitle", updateTitle);


const updateMenu = function () {
  const pastSubs = Controllers.getHistory();
  return app.history.show(
    new Views.HistoryView({
      collection: new Backbone.Collection(pastSubs)
    }));
};


const toggleMenu = function (bool) {
  const menu = $(".wrapper", $document);
  if (bool === undefined) {
    return menu.toggleClass("toggled");
  } else {
    return menu.toggleClass("toggled", bool);
  }
};
app.commands.setHandler("toggleMenu", toggleMenu);


const hideObjectsOutOfViewport = function (selector) {
  if (selector == null) {
    selector = '.post';
  }
  const $posts = $(selector);
  $posts.css({visibility: 'hidden'});
  $(`${selector}:in-viewport`).removeStyle('visibility');
  return __guard__($(`${selector}:in-viewport:last`).next(), x => x.removeStyle('visibility'));
};


var showSubreddit = function (sub) {
  // Save the name of whatever requested.
  if (sub == null) {
    sub = 'funny';
  }
  Controllers.addHistory(sub, sub);

  toggleMenu(false);
  updateTitle(`/r/${sub}`);
  updateMenu();

  // Display first 5 related subs in the sidebar
  let relatedSubs = Controllers.getRelatedSubs(sub, 5);
  relatedSubs = _.sortBy(relatedSubs, 'sub');
  app.related.show(
    new Views.HistoryView({
      collection: new Backbone.Collection(relatedSubs)
    }));

  // assume the category has changed.
  window.lastPostId = null;

  const collection = new Models.Listing([], {subreddits: sub});

  app.content.show(new Views.ContentView({collection}));
  return collection.fetch();
};
app.commands.setHandler("showSubreddit", showSubreddit);


var showSettings = function () {
  toggleMenu(false);
  document.title = 'Settings';
  return app.content.show(new Views.SettingsView);
};


const redirectToHashUrl = function () {
  // Wrong url mate
  const exp = /\/r\/([a-z+_]+)/.exec(window.location.pathname);
  if (!exp) {
    return;
  }
  const subs = exp[1];  // 'gifs' in '/r/gifs'
  try {
    return window.history.replaceState({}, '', `/r/#/${subs}`);
  } catch (e) {
    return window.location.assign(window.location.href.replace("/r/", "/r/#"));
  }
};

app.on('start', function () {
  redirectToHashUrl();
  setNightMode();
  updateTitle();
  return updateMenu();
});

// Route paths using Backbone history.
// http://stackoverflow.com/a/25337481
app.on("start", function () {
  const router = new AppRouter({
    controller: new RouteController()
  });
  if (!Backbone.history) {
    console.error("Backbone.history not found!");
    return;
  }
  return Backbone.history.start();
});


// Infinite scrolling
app.on("start", function () {
  const preloadPages = settings.get('preloadpages', 4);
  const requiredBTF = window.innerHeight * preloadPages;
  return $window.scrollStopped(function () {
    if (settings.get('autoload')) {
      hideObjectsOutOfViewport('img');
    }

    const currentY = window.innerHeight + window.scrollY;
    if (($document.height() - currentY) < requiredBTF) {
      // Fetch only if the view has a collection attached
      __guard__(app.content.currentView != null ? app.content.currentView.collection : undefined, x => x.fetch());
    }

    // Show current post title
    const currentPost = $('.post:in-viewport:first');
    const model = __guard__(currentPost != null ? currentPost.data('view') : undefined, x1 => x1.model);
    if (model && model.get('subreddit') && model.get('title')) {
      return updateTitle(model.get('subreddit') + ': ' + model.get('title'));
    }
  });
});

// Other events
$('.clear', $document).on('click', function () {
  if (confirm('Clear the list of subreddits?')) {
    settings.remove('pastSubs');
    return window.location.reload();
  }
});

$('.prev-post', $document).on('click', function () {
  let post = $('.post:in-viewport');
  if (!post.length) {
    return;
  }
  if (post.length > 1) {
    // The end of the previous post is still visible
    post = post.first();
  } else {
    post = $('.post').first();
  }
  const scrollTop = post.offset().top - 60;
  return ($window.wScrollTop || $window.scrollTop)(scrollTop);
});

$('.next-post', $document).on('click', function () {
  const scrollTop = $('.post:below-the-fold').first().offset().top - 60;
  return ($window.wScrollTop || $window.scrollTop)(scrollTop);
});

$('.read-post', $document).on('click', function () {
  const scrollTop = $window.scrollTop();
  const posts = [];
  $('.post').each(function (idx, post) {
    post = $(post);
    if (scrollTop >= post.offset().top) {
      return posts.push(post);
    }
  });

  for (let post of Array.from(posts)) {
    try {
      // Use marionette's method where possible
      post.data('view').destroy();
    } catch (err) {
      console.debug(`eck! ${err}`);
      post.remove();
    }
  }

  return $window.scrollTop(0);
});


export default app;