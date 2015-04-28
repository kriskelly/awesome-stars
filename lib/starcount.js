var GithubApi = require('github'),
    Promise = require('bluebird'),
    urlparser = require('./urlparser');

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

function starCount(repoInfo) {
  var noop = Promise.resolve();
  if (!repoInfo) {
    return noop;
  }
  // console.log('fetching star count for ' + repoUrl);
  return github.repos.getAsync(repoInfo)
    .then(function(response) {
      return response['stargazers_count'];
    })
    .catch(function(e) {
      console.log('Error (' + e.code + ') while fetching stars for: ', repoInfo, e);
    });
}

module.exports = starCount;