var url = require('url');
var _ = require('lodash');

module.exports = function parseRepoFromUrl(rawUrl) {
  if (typeof rawUrl !== "string") {
    return;
  }
  var urlObj = url.parse(rawUrl);
  if (urlObj.hostname !== 'github.com') {
    return;
  }
  var pathname = urlObj.pathname;
  if (!pathname) {
    return;
  }
  var pathComponents = _.compact(pathname.split('/'));
  if (pathComponents.length) {
    return {user: pathComponents[0], repo: pathComponents[1]};
  }
}