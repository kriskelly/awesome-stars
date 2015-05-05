var GithubApi = require('github'),
    Promise = require('bluebird'),
    retry = require('bluebird-retry'),
    urlparser = require('./urlparser'),
    request = Promise.promisify(require('request')),
    _ = require('lodash');

var github = new GithubApi({
  version: "3.0.0",
  // debug: true,
  protocol: "https",
  host: "api.github.com",
  timeout: 5000,
  headers: {
    "user-agent": "Awesome-Stars Counter",
    "Accept": "application/vnd.github.quicksilver-preview+json" // Header to enable redirects
  }
});

github.authenticate({
    type: "oauth",
    token: process.env['TOKEN']
});

Promise.promisifyAll(github.repos);

var STARGAZERS_KEY = 'stargazers_count';

function starCount(repoInfo) {
  var noop = Promise.resolve();
  if (!repoInfo) {
    return noop;
  }
  return retry(function() { return github.repos.getAsync(repoInfo) }, {max_retries: 3})
    .then(extractFromResponse)
    .catch(function(e) {
      console.log('Error (' + e.code + ') while fetching stars for: ', repoInfo, e);
    });
}

function extractFromResponse(response) {
  if (isRedirect(response)) {
    var reqOptions = {
      url: response.meta.location,
      headers: {
        'User-Agent': 'Awesome-Stars'
      }
    }
    return request(reqOptions).spread(function(resp) {
      var payload = JSON.parse(resp.body);
      return payload[STARGAZERS_KEY];
    }).catch(function(e) {
      console.log(e);
    });
  }
  return response[STARGAZERS_KEY];
}

function isRedirect(response) {
  var statusCode = response.meta.status.substring(0, 3);
  return _.includes(['301', '302', '307'], statusCode);
}

module.exports = starCount;