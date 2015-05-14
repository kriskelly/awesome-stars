var GithubApi = require('github'),
    Promise = require('bluebird'),
    retry = require('bluebird-retry'),
    urlparser = require('./urlparser'),
    request = Promise.promisify(require('request')),
    _ = require('lodash'),
    datastore = require('./datastore');

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

datastore.connect();

function starCount(repoInfo) {
  var noop = Promise.resolve();
  if (!repoInfo) {
    return noop;
  }

  var cachedStarCount;
  return datastore.fetchAsync(repoInfo.user, repoInfo.repo).then(function(cachedResult) {
    if (cachedResult) {
      if (!_.isFinite(cachedResult.starcount)) {
        console.log('error retrieving starcount for: ', cachedResult);
      }
      cachedStarCount = cachedResult.starcount;
      return fetchFromGithub(repoInfo, cachedResult.lastmodified);
    } else {
      return fetchFromGithub(repoInfo);
    }
  }).then(function(githubResponse) {
    if (!githubResponse) {
      return;
    }
    if (githubResponse.notModified) {
      return cachedStarCount;
    } else {
      return datastore.saveAsync(repoInfo.user, 
                                 repoInfo.repo,
                                 githubResponse.starcount,
                                 githubResponse.lastModified)
      .then(function() {
        return githubResponse.starcount;
      });
    }
  });
}

function fetchFromGithub(repoInfo, lastModified) {
  return retry(function() { 
    var reqInfo = _.clone(repoInfo);
    if (lastModified) {
      reqInfo.headers = {
        'If-Modified-Since': lastModified
      };
    }

    return github.repos.getAsync(reqInfo);
  }, {max_retries: 3}).then(function(response) {
    if (isNotModified(response)) {
      return {notModified: true};
    } else if (isRedirect(response)) {
      return followRedirect(response).then(function(response) {
        var payload = JSON.parse(response.body);
        return extractFromResponse(payload, response.headers);
      });
    } else {
      return extractFromResponse(response, response.meta);
    }
  })
  .catch(function(e) {
    console.log('Error (' + e.code + ') while fetching stars for: ', repoInfo, e);
  });  
}

function extractFromResponse(response, headers) {
  return {starcount: response[STARGAZERS_KEY], lastModified: headers['last-modified']};
}

function followRedirect(response) {
  var reqOptions = {
    url: response.meta.location,
    headers: {
      'User-Agent': 'Awesome-Stars'
    }
  }
  return request(reqOptions).spread(function(resp) {
    return resp;
  }).catch(function(e) {
    console.log(e);
  });
}

function isRedirect(response) {
  return _.includes(['301', '302', '307'], getStatusCode(response));
}

function isNotModified(response) {
  return _.includes('304', getStatusCode(response));
}

function getStatusCode(response) {
  return response.meta.status.substring(0, 3);
}

module.exports = starCount;