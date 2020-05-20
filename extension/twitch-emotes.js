const { EmoteFetcher, EmoteParser } = require('twitch-emoticons');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const clientID = 'pseen1kwhsh5z1271z0eu5449odred';
const fetcher = new EmoteFetcher();
const parser = new EmoteParser(fetcher, {
	type: 'html',
	match: /(\w+)/g
});

module.exports = async function(nodecg) {
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

	try {
		if (checkConfig()) {
			await fetcher.fetchBTTVEmotes(String(nodecg.bundleConfig.twitch.channel).toLowerCase());
		}
	} catch (error) {
		nodecg.log.info('No BTTV emotes found for configured channel.');
	}

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

	function checkConfig() {
		return nodecg.bundleConfig || typeof nodecg.bundleConfig.twitch !== 'undefined';
	}
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