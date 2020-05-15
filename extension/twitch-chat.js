const { ChatClient } = require("dank-twitch-irc");

module.exports = function(nodecg) {
	if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.twitch === 'undefined') {
		nodecg.log.error(`"twitch" is not defined in cfg/${nodecg.bundleName}.json! ` + 
			'Some graphics may not function as expected.');
		return;
	}

	const client = new ChatClient();

	client.on('ready', () => console.log('connected to chat'));

	client.on('PRIVMSG', (message) => nodecg.sendMessage('chatMessage', message));

	client.connect();
	client.join(nodecg.bundleConfig.twitch.channel);
}