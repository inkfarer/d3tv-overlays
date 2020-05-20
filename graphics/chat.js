nodecg.listenFor('chatMessage', (message) => {
	const messageElem = document.createElement('div');
	messageElem.classList.add('message');
	message.messageText = message.messageText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

	var msgBadges = '';
	for (let i = 0; i < message.badges.length; i++) {
		const badge = message.badges[i];
		var filename = 'chat-badges/';
		switch(badge.name) {
			case 'subscriber':
				switch (badge.version) {
					case '0':
						filename += 'sub.png';
						break;
					case '3':
						filename += 'sub3.png';
						break;
					case '6':
						filename += 'sub6.png';
						break;
					case '9':
						filename += 'sub9.png';
						break;
					case '12':
						filename += 'sub12.png';
						break;
					default:
						filename += 'sub.png';
				};
				break;
			case 'moderator':
				filename += 'mod.png';
				break;
			case 'staff':
				filename += 'staff.png';
				break;
			case 'broadcaster':
				filename += 'broadcaster.png';
				break;
			case 'premium':
				filename += 'prime.png';
				break;
			case 'turbo':
				filename += 'turbo.png';
				break;
			default:
				continue;
		};
		if (filename === 'chat-badges/') continue;
		msgBadges += `<img class="chat-badge" src="${filename}">`;
	}

	var senderStyle;
	if (message.color) {
		senderStyle = `color: rgb(${message.color.r}, ${message.color.g}, ${message.color.b})`;
	} else {
		senderStyle = `color: rgb(255, 255, 255)`;
	}

	messageElem.id = message.messageID;
	messageElem.setAttribute('username', message.senderUsername);
	messageElem.innerHTML = `${msgBadges}<span class="sender" style="${senderStyle}">${message.senderUsername}: </span>`;
	nodecg.sendMessage('parseEmotes', message.messageText, (error, result) => {
		if (error) {
			console.error(error);
			return;
		}
		
		messageElem.innerHTML += result;
	});
	document.querySelector('.chat-box').appendChild(messageElem);

	//remove the element we just pushed out of sight
	const messageElems = Array.from(document.querySelectorAll('.message')).reverse();
	if (messageElems[4]) {
		messageElems[4].parentNode.removeChild(messageElems[4]);
	}
});

nodecg.listenFor('clearChat', (message) => {
	const userMessages = document.querySelectorAll(`.message[username="${message.targetUsername}"]`);
	for (let i = 0; i < userMessages.length; i++) {
		userMessages[i].parentNode.removeChild(userMessages[i]);
	}
});

nodecg.listenFor('clearMsg', (message) => {
	const targetMessageElem = document.querySelector(`#${message.targetMessageID}`);
	if (targetMessageElem) {
		targetMessageElem.parentNode.removeChild(targetMessageElem);
	};
});