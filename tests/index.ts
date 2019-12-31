declare var require: any;

require('expose-loader?riot!riot');
require('expose-loader?i18n!riot-i18n');

require('expose-loader?videojs!video.js');

require('expose-loader?moment!moment');
require('expose-loader?regeneratorRuntime!regenerator-runtime');

require('expose-loader?Hammer!hammerjs');

import 'social-share-kit';

const testsContext = require.context("./specs", true, /\.+(js|ts)$/);
testsContext.keys().forEach(testsContext);

// add all ts files to include non referenced files in report
const srcContext = require.context("../src/scripts", true, /^(?!.*\.d\.ts$).*\.(js|ts)$/);
srcContext.keys().forEach(srcContext);