'use strict';

module.exports = function (nodecg) {
	require('./lastfm')(nodecg);
	require('./streamlabs')(nodecg);
	require('./twitch-chat')(nodecg);
	require('./twitch-emotes')(nodecg);
};
