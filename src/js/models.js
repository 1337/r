import $ from "jquery";
import _ from "underscore";
import Backbone from "backbone";
import Marionette from "backbone.marionette";

var indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  },
  extend = function (child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }

    function ctor() {
      this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;


const Models = {};

class Settings {
  get(key, defaultValue) {
    const thing = localStorage.getItem(key);
    if (!thing && defaultValue !== undefined) {
      return defaultValue;
    }
    try {
      return JSON.parse(thing);
    } catch (e) {
      return thing;
    }
  }
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  remove(key) {
    localStorage.removeItem(key);
  }
}

Models.settings = new Settings();
const settings = Models.settings;

Models.filterScore = (comments = [], min) => {
  if (min === -1) {
    // Do not filter
    return comments;
  } else if (min === undefined) {
    min = settings.get("minscore", 20);
  }
  return _.compact(
    _.map(comments, item => {
      if (item && item.data && item.data.score && item.data.score >= min) {
        return item;
      }
      return undefined;
    })
  );
};

function filterRead(posts = []) {
  const read = settings.get("readPosts", []);
  const oldRead = _.map(read, _.clone);

  const thing = [];
  posts.forEach(post => {
    const postId = post.id || post.data.id;
    if (postId in read) {
      // console.debug "FILTERED #{postId}"
      post.read = true;
      thing.push(post);
    }
  });

  read.push.apply(read, thing);

  let readPostIds = _.filter(_.pluck(_.uniq(read), "id"));
  readPostIds = _.filter(_.uniq(oldRead.concat(readPostIds)));
  settings.set("readPosts", readPostIds);
  return thing;
}


class ReadOnlyModel extends Backbone.Model {
  sync(method, ...rest) {
    return super.sync('read', ...rest);
  }
}
Models.ReadOnlyModel = ReadOnlyModel;


class Post extends ReadOnlyModel { }
Models.Post = Post;


class Comment extends ReadOnlyModel {
  replies() {
    var comments, ref, ref1;
    comments = (ref = this.get('replies')) != null ? (ref1 = ref.data) != null ? ref1.children : void 0 : void 0;
    return Models.Comments(Models.filterScore(comments));
  }
}
Models.Comment = Comment;


class Comments extends Backbone.Collection {
  initialize(models, options) {
    if (options == null) {
      options = {};
    }
    this.permalink = options.permalink || '';
  }

  url() {
    return "http://www.reddit.com" + this.permalink + ".json?jsonp=?";
  };

  model(attrs, options) {
    if (attrs.kind && attrs.data) {
      return new Models.Comment(attrs.data, options);
    }
    return new Models.Comment(attrs, options);
  }

  fetch(options) {
    var dfr;
    if (options == null) {
      options = {};
    }
    dfr = new $.Deferred();
    _.extend(options, {
      cache: true,
      timeout: 15000
    });
    if (!this.permalink) {
      _.defer(function () {
        return dfr.resolve([]);
      });
      return dfr.promise();
    }
    Backbone.Collection.prototype.fetch.call(this, options).done((function (_this) {
      return function (data) {
        return dfr.resolve(data);
      };
    })(this));
    return dfr.promise();
  }

  parse(resp) {
    var comments, ref, ref1, root;
    root = resp;
    if (resp.length) {
      root = resp[1];
    }
    comments = (root != null ? (ref = root.data) != null ? ref.children : void 0 : void 0) || (root != null ? (ref1 = root.data) != null ? ref1.replies : void 0 : void 0);
    comments = Models.filterScore(comments);
    return _.sortBy(comments, (function (c) {
      return 1e5 - c.data.score;
    }));
  }
}
Models.Comments = Comments;

class Listing extends Backbone.Collection {
  initialize(models, options) {
    if (options == null) {
      options = {};
    }
    console.debug("Listing initialized with " + options.subreddits);
    return this.subreddits = options.subreddits;
  }

  model(attrs, options) {
    return new Models.Post(attrs, options);
  }

  url() {
    var url;
    if (this.subreddits === 'mine') {
      url = "http://www.reddit.com/.json?jsonp=?";
    } else {
      url = "http://www.reddit.com/r/" + this.subreddits + "/.json?jsonp=?";
    }
    if (window.lastPostId) {
      url += '&after=' + window.lastPostId;
    }
    return url;
  }

  fetch(options) {
    var dfr;
    if (options == null) {
      options = {};
    }
    dfr = new $.Deferred();
    _.extend(options, {
      add: true,
      merge: true,
      remove: false,
      reset: false,
      cache: true,
      timeout: 30000
    });
    Backbone.Collection.prototype.fetch.call(this, options).done(dfr.resolve).fail(function (reason) {
      return dfr.resolve([]);
    });
    return dfr.promise();
  }

  parse(resp) {
    var posts, ref, ref1, ref2;
    posts = _.pluck(Models.filterScore(resp != null ? (ref = resp.data) != null ? ref.children : void 0 : void 0), 'data');
    if (resp != null ? (ref1 = resp.data) != null ? ref1.after : void 0 : void 0) {
      window.lastPostId = resp != null ? (ref2 = resp.data) != null ? ref2.after : void 0 : void 0;
    } else {
      window.lastPostId = _.last(posts).id;
    }
    _.each(posts, function (post) {
      if (post.subreddit === 'unexpectedjihad') {
        post.subreddit = 'videos';
        return post.score = parseInt(post.score, 10) * 10;
      }
    });
    if (settings.get('filterread')) {
      posts = filterRead(posts);
    }
    return posts;
  };
}
Models.Listing = Listing;

export default Models;
