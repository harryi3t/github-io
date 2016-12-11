'use strict';
var self = Adapter;
module.exports = self;
var url = 'https://api.github.com';

var async = require('async');
var request = require('request');
var util = require('util');

var querystring = require('querystring');
var parseLinks = require('parse-links');

function Adapter(token) {
  this.token = token;
  if (url) {
    this.baseUrl = url;
  } else {
    console.warn('Inside common|github|Adapter: Using default url');
    this.baseUrl = config.githubApiUrl;
  }
}

Adapter.prototype.get = function (relativeUrl, callback) {
  var opts = {
    method: 'GET',
    url: relativeUrl.indexOf('http') === 0 ? relativeUrl : this.baseUrl +
    relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'token ' + this.token,
      'User-Agent': 'Shippable API',
      'Accept': 'application/vnd.GithubProvider.v3'
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|github|%s|GET|url:%s', self.name, relativeUrl);

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

Adapter.prototype.post = function (relativeUrl, json, callback) {
  var opts = {
    method: 'POST',
    url: this.baseUrl + relativeUrl,
    followAllRedirects: true,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'token ' + this.token,
      'User-Agent': 'Shippable v3',
      'Accept': 'application/vnd.GithubProvider.v3'
    },
    json: json
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|github|%s|POST|url:%s', self.name,
    relativeUrl);

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

Adapter.prototype.put = function (relativeUrl, json, callback) {
  var opts = {
    method: 'PUT',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'token ' + this.token,
      'User-Agent': 'Shippable v3',
      'Accept': 'application/vnd.GithubProvider.v3'
    },
    json: json
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|github|%s|PUT|url:%s', self.name, relativeUrl);

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

Adapter.prototype.del = function (relativeUrl, callback) {
  var opts = {
    method: 'DELETE',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'token ' + this.token,
      'User-Agent': 'Shippable v3',
      'Accept': 'application/vnd.GithubProvider.v3'
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|github|%s|DELETE|url:%s', self.name,
    relativeUrl);

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    callback(bag.err, bag.parsedBody, bag.res);
  });
};

// common helper methods
function _performCall(bag, next) {
  var who = bag.who + '|' + _performCall.name;

  bag.startedAt = Date.now();
  request(bag.opts, function (err, res, body) {
    var interval = Date.now() - bag.startedAt;

    bag.res = res;
    bag.body = body;
    if (res && res.statusCode > 299) err = err || res.statusCode;
    if (err) {
      bag.err = err;
    }
    next();
  });
}

function _parseResponse(bag, next) {
  var who = bag.who + '|' + _parseResponse.name;

  if (bag.res && bag.res.headers.link) {
    bag.headerLinks = parseLinks(bag.res.headers.link);
  }

  if (bag.body) {
    if (typeof bag.body === 'object') {
      bag.parsedBody = bag.body;
    } else {
      try {
        bag.parsedBody = JSON.parse(bag.body);
      } catch (e) {
        bag.err = e;
      }
    }
  }
  next();
}

Adapter.prototype.getRateLimit = function (callback) {
  this.get('/rate_limit', callback);
};

Adapter.prototype.getCurrentUser = function (callback) {
  this.get('/user', callback);
};

Adapter.prototype.postIssue = function (owner, repo, body, callback) {
  var allIssues = [];
  var self = this;
  var url = '/repos/' + owner + '/' + repo +'/issues';
  this.post(url, body, callback);
};

Adapter.prototype.getIssue = function (owner, repo, number, callback) {
  var allIssues = [];
  var self = this;
  var url = '/repos/' + owner + '/' + repo +'/issues/' + number;
  this.get(url, callback);
};
