import * as functions from './src/functions.js';
import * as events from './src/events.js';

functions.renderPlaylist();
setInterval(functions.checkAndSkipIfStuck, 2000);