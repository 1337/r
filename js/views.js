// Generated by CoffeeScript 1.9.3
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['jquery', 'underscore', 'marionette', 'Models', 'imagesloaded'], function($, _, Marionette, Models, imagesLoaded) {
    var $document, $window, Views, expandImages, gftcatProcessor, imgurProcessor, safeText, settings;
    Views = {};
    $window = $(window);
    $document = $(document, $window);
    settings = Models.settings;
    safeText = function(text) {
      var el;
      if (text == null) {
        text = "";
      }
      text = text.replace(/<!--\w+-->/, '');
      el = $('<div />').html(text);
      return $(el).text();
    };
    imgurProcessor = function(url) {
      var extension;
      if (url.indexOf('imgur') <= -1) {
        return url;
      }
      url = url.replace('i.imgur', 'imgur').replace('imgur', 'i.imgur');
      if (settings.get('autoload')) {
        if (url.substr(-5) === ".gifv") {
          url = url.slice(0, -1);
        }
      } else {
        if (url.substr(-5) === ".gifv") {
          url = url.slice(0, -5) + 'h.jpg';
        }
      }
      extension = /(gif|jpe?g|png)$/i;
      if (!extension.exec(url)) {
        if (settings.get('autoload')) {
          url += '.jpg';
        } else {
          url += "h.jpg";
        }
      }
      if (!settings.get('autoload')) {
        url = url.replace(/\.gif$/, 'h.jpg');
      }
      return url;
    };
    gftcatProcessor = function(url) {
      if (url.indexOf('gfycat') === -1) {
        return url;
      }
      return url.replace(/-100.jpg/g, '-poster.jpg');
    };
    expandImages = function(html) {
      html = html.replace(/gifv/, 'gif');
      return html.replace(/<a href="([^'"]+\.(jpe?g|gifv?|png)[^'"]*)">([^&<]+)<\/a>/ig, "<div class=\"comment-image\">\n    <a href=\"$1\" target=\"_blank\">$3</a>\n    <img src=\"$1\" />\n</div>");
    };
    Views.CommentsView = (function(superClass) {
      extend(CommentsView, superClass);

      function CommentsView() {
        return CommentsView.__super__.constructor.apply(this, arguments);
      }

      CommentsView.prototype.template = "#comments_template";

      CommentsView.prototype.collection = null;

      CommentsView.prototype.childView = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.template = "#comment_template";

        _Class.prototype.className = "reply";

        _Class.prototype.regions = {
          replies: '.replies'
        };

        _Class.prototype.templateHelpers = {
          body: function() {
            var body;
            body = safeText(this.body_html);
            if (settings.get('autoload')) {
              return expandImages(body);
            } else {
              return body;
            }
          }
        };

        _Class.prototype.onShow = function() {
          var filteredComments, firstChild, hasReplies, ref, ref1, ref2, ref3, replies, repliesView;
          _.defer((function(_this) {
            return function() {
              var $post, op;
              $post = _this.$el.parents('.post');
              op = $.trim($post.find('.author:first').text());
              if (_this.model.get('author') === op) {
                return _this.$el.addClass('op');
              }
            };
          })(this));
          hasReplies = (ref = this.model.get('replies')) != null ? (ref1 = ref.data) != null ? (ref2 = ref1.children) != null ? ref2.length : void 0 : void 0 : void 0;
          if (!(hasReplies && (hasReplies >= 1))) {
            return;
          }
          firstChild = this.model.get('replies').data.children[0];
          if (firstChild.kind === 'more') {
            return;
          }
          filteredComments = Models.filterScore([firstChild]);
          replies = new Models.Comments(filteredComments);
          repliesView = new Views.CommentsView({
            collection: replies
          });
          if (this.model.get('gilded')) {
            this.$el.addClass('gilded');
          }
          return (ref3 = this.replies) != null ? ref3.show(repliesView) : void 0;
        };

        return _Class;

      })(Marionette.LayoutView);

      CommentsView.prototype.initialize = function(options) {
        if (options == null) {
          options = {};
        }
        this.collection = options.collection;
        return this.collection.fetch();
      };

      CommentsView.prototype.attachHtml = function(collectionView, childView, index) {
        var il, itemAdded, ref;
        itemAdded = function() {
          var links;
          collectionView.$el.append(childView.el);
          links = collectionView.$('a');
          return links.attr('target', '_blank');
        };
        if ((ref = childView.$('img')) != null ? ref.length : void 0) {
          il = imagesLoaded(childView.$el);
          return il != null ? il.on('always', function(instance) {
            return itemAdded();
          }) : void 0;
        } else {
          return itemAdded();
        }
      };

      return CommentsView;

    })(Marionette.CollectionView);
    Views.MenuView = (function(superClass) {
      extend(MenuView, superClass);

      function MenuView() {
        return MenuView.__super__.constructor.apply(this, arguments);
      }

      MenuView.prototype.template = '#menu_template';

      MenuView.prototype.events = {
        "click .navbar-toggle": function() {
          return typeof App !== "undefined" && App !== null ? App.commands.execute("toggleMenu") : void 0;
        }
      };

      return MenuView;

    })(Marionette.LayoutView);
    Views.PostView = (function(superClass) {
      extend(PostView, superClass);

      function PostView() {
        return PostView.__super__.constructor.apply(this, arguments);
      }

      PostView.prototype.className = 'post';

      PostView.prototype.template = '#post_template';

      PostView.prototype.regions = {
        comments: '.comments'
      };

      PostView.prototype.events = {
        'click *': function() {
          return typeof App !== "undefined" && App !== null ? App.commands.execute("toggleMenu", false) : void 0;
        }
      };

      PostView.prototype.templateHelpers = {
        unescape: safeText,
        thumb: function() {
          var ref, ref1, url;
          if (this.url.indexOf('imgur') > -1) {
            return imgurProcessor(this.url);
          }
          url = (ref = this.media) != null ? (ref1 = ref.oembed) != null ? ref1.thumbnail_url : void 0 : void 0;
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

      PostView.prototype.onShow = function() {
        var commentsView, id, replies;
        _.defer((function(_this) {
          return function() {
            var links;
            links = _this.$('a');
            links.attr('target', '_blank');
            return links.each(function(idx, el) {
              var $el, href;
              $el = $(el);
              href = $el.attr('href');
              if (href.indexOf('/r/') === 0) {
                $el.attr('href', '#' + href.slice(2));
                return $el.removeAttr('target');
              }
            });
          };
        })(this));
        if (settings.get('showcomments', true)) {
          replies = new Models.Comments([], {
            permalink: this.model.get('permalink')
          });
          commentsView = new Views.CommentsView({
            collection: replies
          });
          if (this.model.get('gilded')) {
            this.$el.addClass('gilded');
          }
          if (this.model.get('read')) {
            this.$el.addClass('read');
          } else {
            id = requestAnimationFrame((function(_this) {
              return function() {
                _this.getRegion('comments').show(commentsView);
                return cancelAnimationFrame(id);
              };
            })(this));
          }
        }
        return this.$el.data('view', this);
      };

      return PostView;

    })(Marionette.LayoutView);
    Views.ContentView = (function(superClass) {
      extend(ContentView, superClass);

      function ContentView() {
        return ContentView.__super__.constructor.apply(this, arguments);
      }

      ContentView.prototype.template = '#content_template';

      ContentView.prototype.childView = Views.PostView;

      ContentView.prototype.childViewContainer = ".posts";

      ContentView.prototype.attachHtml = function(collectionView, childView, index) {
        var il, itemAdded, ref;
        itemAdded = function() {
          var id;
          return id = requestAnimationFrame(function() {
            collectionView.$el.append(childView.el);
            return cancelAnimationFrame(id);
          });
        };
        if ((ref = childView.$('img')) != null ? ref.length : void 0) {
          il = imagesLoaded(childView.$el);
          return il != null ? il.on('always', function(instance) {
            return itemAdded();
          }) : void 0;
        } else {
          return _.defer(function() {
            return itemAdded();
          });
        }
      };

      return ContentView;

    })(Marionette.CompositeView);
    Views.HistoryView = (function(superClass) {
      extend(HistoryView, superClass);

      function HistoryView() {
        return HistoryView.__super__.constructor.apply(this, arguments);
      }

      HistoryView.prototype.childView = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.template = '#history_template';

        _Class.prototype.tagName = 'li';

        return _Class;

      })(Marionette.ItemView);

      HistoryView.prototype.tagName = 'ul';

      HistoryView.prototype.className = 'sidebar-nav';

      return HistoryView;

    })(Marionette.CollectionView);
    Views.SettingsView = (function(superClass) {
      extend(SettingsView, superClass);

      function SettingsView() {
        return SettingsView.__super__.constructor.apply(this, arguments);
      }

      SettingsView.prototype.template = '#settings_template';

      SettingsView.prototype.className = 'container';

      SettingsView.prototype.ui = {
        'minscore': '#minscore',
        'autoload': '#autoload',
        'filterread': '#filterread',
        'nightmode': '#nightmode',
        'preloadpages': '#preloadpages',
        'showcomments': '#showcomments'
      };

      SettingsView.prototype.onShow = function() {
        App.commands.execute('updateTitle', 'Settings');
        this.ui.minscore.val(settings.get('minscore', 20));
        this.ui.preloadpages.val(settings.get('preloadpages', 4));
        this.ui.autoload.attr('checked', settings.get('autoload', false));
        this.ui.filterread.attr('checked', settings.get('filterread', false));
        this.ui.nightmode.attr('checked', settings.get('nightmode', false));
        return this.ui.showcomments.attr('checked', settings.get('showcomments', true));
      };

      SettingsView.prototype.events = {
        'click .save': function(e) {
          e.preventDefault();
          settings.set('minscore', this.ui.minscore.val());
          settings.set('preloadpages', this.ui.preloadpages.val());
          settings.set('autoload', this.ui.autoload.prop('checked'));
          settings.set('filterread', this.ui.filterread.prop('checked'));
          settings.set('nightmode', this.ui.nightmode.prop('checked'));
          settings.set('showcomments', this.ui.showcomments.prop('checked'));
          return window.location.reload();
        }
      };

      return SettingsView;

    })(Marionette.LayoutView);
    return Views;
  });

}).call(this);
