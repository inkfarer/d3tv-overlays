const { ChatClient } = require("dank-twitch-irc");

module.exports = function(nodecg) {
	if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.twitch === 'undefined') {
		nodecg.log.error(`"twitch" is not defined in cfg/${nodecg.bundleName}.json! ` + 
			'Some graphics may not function as expected.');
		return;
	}

	const client = new ChatClient();

	client.on('ready', () => nodecg.log.info(`connected to chat - user ${nodecg.bundleConfig.twitch.channel}`));

	client.on('PRIVMSG', (message) => nodecg.sendMessage('chatMessage', message));

	//handle message deletion events
	client.on('CLEARCHAT', (message) => nodecg.sendMessage('clearChat', message));
	client.on('CLEARMSG', (message) => nodecg.sendMessage('clearMsg', message));

	client.connect();
	client.join(String(nodecg.bundleConfig.twitch.channel).toLowerCase()).then(null, (reason) => {
		nodecg.log.error(`${reason} - Chat might not function properly.`);
		return;
	});
};