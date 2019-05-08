/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import $ from 'jquery';
import _ from 'underscore';
import Marionette from 'backbone.marionette';
import Models from './models';
import imagesLoaded from 'imagesloaded/imagesloaded.pkgd';


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}


const Views = {};
const {settings} = Models;


function safeText(text) {
  if (text == null) {
    text = "";
  }
  text = text.replace(/<!--\w+-->/, '');
  var el = $('<div />').html(text);
  return $(el).text();
}


function imgurProcessor(url) {
  if (url.indexOf('imgur') <= -1) {
    return url;
  }

  url = url.replace('i.imgur', 'imgur').replace('imgur', 'i.imgur');

  if (settings.get('autoload')) {
    if (url.substr(-5) === ".gifv") {
      url = url.slice(0, +-2 + 1 || undefined);
    }
  } else {
    if (url.substr(-5) === ".gifv") {
      url = url.slice(0, +-6 + 1 || undefined) + 'h.jpg';
    }
  }

  var extension = /(gif|jpe?g|png)$/i;
  if (!extension.exec(url)) {
    if (settings.get('autoload')) {
      url += '.jpg';  // autoprefixer for imgur links
    } else {
      url += "h.jpg";  // 'h' becomes thumbnail
    }
  }

  if (!settings.get('autoload')) {
    url = url.replace(/\.gif$/, 'h.jpg');
  }

  return url;
}


function gftcatProcessor(url) {
  if (url.indexOf('gfycat') === -1) {
    return url;
  }
  // https://www.reddit.com/r/gfycat/comments/1zjnqt/getting_thumbnails_from_gfys/
  return url.replace(/-100.jpg/g, '-poster.jpg');
};


// Given html, find links to images and turn them into image tags
function expandImages(html) {
  html = html.replace(/gifv/, 'gif');
  return html.replace(
    /<a href="([^'"]+\.(jpe?g|gifv?|png)[^'"]*)">([^&<]+)<\/a>/ig,
    `<div class="comment-image">
        <a href="$1" target="_blank">$3</a>
        <img src="$1" />
       </div>`
  );
};


class CommentsChildView extends Marionette.LayoutView {
  constructor() {
    super();
    this.template = "#comment-template";
    this.className = "reply";
    this.regions = {replies: '.replies'};

    this.templateHelpers = {
      body() {
        // pre (post?) process the reddit comment
        var body = safeText(this.body_html);
        if (settings.get('autoload')) {
          return expandImages(body);
        } else {
          return body;
        }
      }
    };
  }

  onShow() {
    _.defer(() => {
      // Traverse up, find OP's name, and highlight if applicable.
      var $post = this.$el.parents('.post');
      var op = $.trim($post.find('.author:first').text());
      if (this.model.get('author') === op) {
        return this.$el.addClass('op');
      }
    });

    var hasReplies = __guard__(__guard__(__guard__(this.model.get('replies'), x2 => x2.data), x1 => x1.children), x => x.length);
    if (!hasReplies || (!(hasReplies >= 1))) {
      return;
    }
    var firstChild = this.model.get('replies').data.children[0];
    if (firstChild.kind === 'more') {
      return;
    }

    var filteredComments = Models.filterScore([firstChild]);
    var replies = new Models.Comments(filteredComments);
    var repliesView = new Views.CommentsView({collection: replies});
    if (this.model.get('gilded')) {
      this.$el.addClass('gilded');
    }
    return (this.replies != null ? this.replies.show(repliesView) : undefined);
  }
}


class CommentsView extends Marionette.CollectionView {
  constructor() {
    super();
    this.template = "#comments-template";
    this.collection = null;
    this.childView = CommentsChildView;
  }

  initialize(options) {
    if (options == null) {
      options = {};
    }
    this.collection = options.collection;
    return this.collection.fetch();
  }

  // Make masonry layout whenever a new post is added
  attachHtml(collectionView, childView, index) {
    var itemAdded = function () {
      collectionView.$el.append(childView.el);
      var links = collectionView.$('a');
      return links.attr('target', '_blank');
    };

    if (__guard__(childView.$('img'), x => x.length)) {
      var il = imagesLoaded(childView.$el);
      return (il != null ? il.on('always', instance => itemAdded()) : undefined);
    } else {
      return itemAdded();
    }
  }
}

Views.CommentsView = CommentsView;


class MenuView extends Marionette.LayoutView {
  constructor() {
    super();
    this.template = '#menu-template';
    this.events = {
      "click .navbar-toggle"() {
        return (typeof App !== 'undefined' && App !== null ? App.commands.execute("toggleMenu") : undefined);
      }
    };
  }
}

Views.MenuView = MenuView;


class PostView extends Marionette.LayoutView {
  constructor() {
    super();
    this.className = 'post';
    this.template = '#post-template';
    this.regions = {comments: '.comments'};
    this.events = {
      'click *'() {
        return (typeof App !== 'undefined' && App !== null ? App.commands.execute("toggleMenu", false) : undefined);
      }
    };

    this.templateHelpers = {
      unescape: safeText,
      thumb() {
        // http://marionettejs.com/docs/v2.3.2/marionette.view.html#accessing-data-within-the-helpers
        if (this.url.indexOf('imgur') > -1) {
          return imgurProcessor(this.url);
        }

        let url = __guard__(this.media != null ? this.media.oembed : undefined, x => x.thumbnail_url);
        if (url) {
          url = gftcatProcessor(url);
        }
        if (url) {
          return url;
        }

        url = this.thumbnail;
        if (url === 'self') {
          return '';
        } else {
          return url;
        }
      }
    };
  }

  onShow() {
    _.defer(() => {
      // Don't piss users off.
      var links = this.$('a');
      links.attr('target', '_blank');
      // Handle relative subreddit links
      return links.each(function (idx, el) {
        var $el = $(el);
        var href = $el.attr('href');
        if (href.indexOf('/r/') === 0) {
          $el.attr('href', `#${href.slice(2)}`);
          // let the link open same tab
          return $el.removeAttr('target');
        }
      });
    });

    if (settings.get('showcomments', true)) {
      var replies = new Models.Comments([], {
        permalink: this.model.get('permalink')
      });
      var commentsView = new Views.CommentsView({
        collection: replies
      });
      if (this.model.get('gilded')) {
        this.$el.addClass('gilded');
      }
      if (this.model.get('read')) {
        this.$el.addClass('read');
      } else {
        // Show comments if unread.
        var id = requestAnimationFrame(() => {
          this.getRegion('comments').show(commentsView);
          return cancelAnimationFrame(id);
        });
      }
    }

    // Keep reference of itself on the element
    return this.$el.data('view', this);
  }
}
Views.PostView = PostView;


class ContentView extends Marionette.CompositeView {
  constructor() {
    super();
    this.template = '#content-template';
    this.childView = Views.PostView;
    this.childViewContainer = ".posts";
  }

  attachHtml(collectionView, childView, index) {
    // Make masonry layout whenever a new post is added
    var itemAdded = function () {
      let id;
      return id = requestAnimationFrame(function () {
        collectionView.$el.append(childView.el);
        return cancelAnimationFrame(id);
      });
    };

    if (__guard__(childView.$('img'), x => x.length)) {
      var il = imagesLoaded(childView.$el);
      return (il != null ? il.on('always', instance => itemAdded()) : undefined);
    } else { // no images in the box
      return _.defer(() => itemAdded());
    }
  }
}
Views.ContentView = ContentView;


class HistoryChildView extends Marionette.ItemView {
  constructor() {
    super();
    this.template = '#history-template';
    this.tagName = 'li';
  }
}

class HistoryView extends Marionette.CollectionView {
  constructor() {
    super();
    this.childView = ChildView;
    this.tagName = 'ul';
    this.className = 'sidebar-nav';
  }
}

Views.HistoryView = HistoryView;


class SettingsView extends Marionette.LayoutView {
  constructor() {
    super();
    this.template = '#settings-template';
    this.className = 'container';
    this.ui = {
      'minscore': '#minscore',
      'autoload': '#autoload',
      'filterread': '#filterread',
      'nightmode': '#nightmode',
      'preloadpages': '#preloadpages',
      'showcomments': '#showcomments'
    };
    this.events = {
      'click .save'(e) {
        e.preventDefault();
        settings.set('minscore', this.ui.minscore.val());
        settings.set('preloadpages', this.ui.preloadpages.val());
        settings.set('autoload', this.ui.autoload.prop('checked'));
        settings.set('filterread', this.ui.filterread.prop('checked'));
        settings.set('nightmode', this.ui.nightmode.prop('checked'));
        settings.set('showcomments', this.ui.showcomments.prop('checked'));

        window.location.reload();
      }
    };
  }

  onShow() {
    App.commands.execute('updateTitle', 'Settings');

    this.ui.minscore.val(
      settings.get('minscore', 20));
    this.ui.preloadpages.val(
      settings.get('preloadpages', 4));
    this.ui.autoload.attr('checked',
      settings.get('autoload', false));
    this.ui.filterread.attr('checked',
      settings.get('filterread', false));
    this.ui.nightmode.attr('checked',
      settings.get('nightmode', false));
    this.ui.showcomments.attr('checked',
      settings.get('showcomments', true));
  }
}


Views.SettingsView = SettingsView;


export default Views;