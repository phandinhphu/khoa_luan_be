const { exec: _exec } = require('child_process');
const util = require('util');

module.exports.exec = util.promisify(_exec);