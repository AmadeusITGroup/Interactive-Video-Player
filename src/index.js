require('expose-loader?riot!riot');
require('expose-loader?i18n!riot-i18n');

require('expose-loader?videojs!video.js');

require('expose-loader?moment!moment');
require('expose-loader?regeneratorRuntime!regenerator-runtime');

require('expose-loader?Hammer!hammerjs');

require('expose-loader?GLightbox!glightbox');
require('./locales');

import 'riot-hot-reload';
import 'social-share-kit';
import { Player } from './scripts/player';
import './styles/app.scss';

export default Player;