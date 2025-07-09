const fs = require("fs");

module.exports = function isFolder(path) {
  return fs.lstatSync(path).isDirectory() && fs.existsSync(path);
}