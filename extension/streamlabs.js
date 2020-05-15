const io = require('socket.io-client');

module.exports = function (nodecg) {
	if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.streamlabs === 'undefined') {
		nodecg.log.error(`"streamlabs" is not defined in cfg/${nodecg.bundleName}.json! ` + 
			'Some graphics may not function as expected.');
		return;
	}

	const latestFollower = nodecg.Replicant('latestFollower', {defaultValue: {
		name: 'unknown',
	}});

	const latestSub = nodecg.Replicant('latestSub', {defaultValue: {
		name: 'unknown',
		months: 1,
		message: null
	}});

	const latestDonation = nodecg.Replicant('latestDonation', {defaultValue: {
		type: 'streamlabs', // 'streamlabs' || 'bits'
		name: 'unknown',
		amount: '$25.00',
		message: null
	}});

	const opts = {
		reconnect: true
	};

	const socket = io.connect(`https://sockets.streamlabs.com/?token=${nodecg.bundleConfig.streamlabs.socket_token}`, opts);

	socket.on('event', event => {
		const unformatted = event.message instanceof Array ? event.message.pop() : event.message;

		if (!(unformatted instanceof Object)) return;

		//latest follower, sub and cheers

		/*console.log(event);
		console.log(unformatted);*/

		switch(event.type) {
			case 'follow':
				latestFollower.value = {
					name: unformatted.name
				}
				return;
			case 'resub':
			case 'subscription':
				latestSub.value = {
					name: unformatted.name,
					months: unformatted.months,
					message: unformatted.message
				};
				return;
			case 'donation':
			case 'bits':
				latestDonation.value = {
					type: `${event.type === 'donation' ? 'streamlabs' : 'bits'}`,
					name: unformatted.name,
					amount: `${event.type === 'donation' ? unformatted.formatted_amount : unformatted.amount}`,
					message: unformatted.message
				};
				return;	
		};
	});
}