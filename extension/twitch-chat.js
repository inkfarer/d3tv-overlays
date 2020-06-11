const { EmoteFetcher, EmoteParser } = require('twitch-emoticons');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { ChatClient } = require("dank-twitch-irc");
const { resolve } = require('path');

const clientID = 'pseen1kwhsh5z1271z0eu5449odred';
const fetcher = new EmoteFetcher();
const parser = new EmoteParser(fetcher, {
	type: 'html',
	match: /(\w+)/g
});

module.exports = async function(nodecg) {
	if (!checkConfig) {
		nodecg.log.error(`"twitch" is not defined in cfg/${nodecg.bundleName}.json! ` + 
			'Some graphics may not function as expected.');
		return;
	}

	// get global emotes
	try {
		await fetcher.fetchTwitchEmotes(null);
		await fetcher.fetchBTTVEmotes(null);
		
		if (checkConfig()) {
			getUserID(nodecg.bundleConfig.twitch.channel, async (json) => {
				await fetcher.fetchTwitchEmotes(json.users[0]._id);
			});
		}
	} catch (error) {
		nodecg.log.error(error);
	}

	//get channel bttv emotes
	try {
		if (checkConfig()) {
			await fetcher.fetchBTTVEmotes(String(nodecg.bundleConfig.twitch.channel).toLowerCase());
		}
	} catch (error) {
		nodecg.log.info('No BTTV emotes found for configured channel.');
	}

	//get channel ffz emotes
	try {
		if (checkConfig()) {
			await fetcher.fetchFFZEmotes(String(nodecg.bundleConfig.twitch.channel).toLowerCase());
		}
	} catch (error) {
		nodecg.log.info('No FFZ emotes found for configured channel.');
	}

	nodecg.listenFor('parseEmotes', (value, ack) => {
		ack(null, parser.parse(value));
	});

	async function cacheSubEmotes(channelName) {
		return new Promise((resolve, reject) => {
			getUserID(channelName, async (json) => {
				fetcher.fetchTwitchEmotes(json.users[0]._id).then(() => {resolve(true)});
			});
		});
	};

	function checkConfig() {
		return nodecg.bundleConfig || typeof nodecg.bundleConfig.twitch !== 'undefined';
	}

	// twitch chat
	const client = new ChatClient();
	const cachedSubEmotes = [nodecg.bundleConfig.twitch.channel, 'Twitch', null];

	client.on('ready', () => nodecg.log.info(`connected to chat - user ${nodecg.bundleConfig.twitch.channel}`));

	client.on('PRIVMSG', async (message) =>  {
		if (message.emotes.length === 0) {
			nodecg.sendMessage('chatMessage', message);
			return;
		}
		for (let i = 0; i < message.emotes.length; i++) {
			getTwitchChannelFromEmoteId(message.emotes[i].id, async (json) => {
				if (json) {
					let channelName = json[0].channel_name;
					if (cachedSubEmotes.includes(channelName)) return;

					cachedSubEmotes.push(channelName);
					await cacheSubEmotes(channelName);
					nodecg.log.debug(`caching emotes for channel ${channelName}`);
				}
				if (i === message.emotes.length - 1) {
					nodecg.sendMessage('chatMessage', message);
				}
			});
		}
	});

	//handle message deletion events
	client.on('CLEARCHAT', (message) => nodecg.sendMessage('clearChat', message));
	client.on('CLEARMSG', (message) => nodecg.sendMessage('clearMsg', message));

	client.connect();
	client.join(String(nodecg.bundleConfig.twitch.channel).toLowerCase()).then(null, (reason) => {
		nodecg.log.error(`${reason} - Chat might not function properly.`);
		return;
	});

};

function getUserID(username, callback) {
	let req = new XMLHttpRequest();

	req.onreadystatechange = () => {
		if (req.readyState === 4 && req.status === 200) {
			let json = JSON.parse(req.responseText);
			if (json['users'].length > 0) {
				callback(json);
			}
		} else if (req.readyState === 4) {
			nodecg.log.error('Error finding Twitch user ID - Channel may be invalid');
			callback(null);
		}
	}

	req.open("GET", "https://api.twitch.tv/kraken/users?login=" + username, true);
	req.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
	req.setRequestHeader('Client-ID', clientID);
	req.send(null);
};

function getTwitchChannelFromEmoteId(emoteID, callback) {
	let req = new XMLHttpRequest();

	req.onreadystatechange = () => {
		if (req.readyState === 4 && req.status === 200) {
			let json = JSON.parse(req.responseText);
			callback(json);
		} else if (req.readyState === 4) {
			nodecg.log.error('Error getting twitch channel from emote');
			callback(null);
		}
	}

	req.open("GET", "https://api.twitchemotes.com/api/v4/emotes?id=" + emoteID, true);
	req.send(null);
}