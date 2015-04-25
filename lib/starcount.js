var GithubApi = require('github'),
    Promise = require('bluebird');

var github = new GithubApi({
  version: "3.0.0",
  // debug: true,
  protocol: "https",
  host: "api.github.com",
  timeout: 5000,
  headers: {
    "user-agent": "Awesome-Stars Counter"
  }
});

Promise.promisifyAll(github.repos);

function parseRepoFromUrl(url) {
  var match = /.*github\.com\/(.+)\/(.+)/.exec(url);
  return {user: match[1], repo: match[2]};
}

function starCount(repoUrl) {
  var repoInfo = parseRepoFromUrl(repoUrl);
  return github.repos.getAsync(repoInfo)
    .then(function(response) {
      return JSON.parse(response)['stargazers_count'];
    });
}

module.exports = starCount;