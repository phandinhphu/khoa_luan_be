const path = require('path');

const PRIVATE_ROOT = path.resolve('private');

module.exports = {
    PRIVATE_ROOT,
    ORIGINAL_DIR: path.join(PRIVATE_ROOT, 'original'),
    RENDERED_DIR: path.join(PRIVATE_ROOT, 'rendered'),
};
