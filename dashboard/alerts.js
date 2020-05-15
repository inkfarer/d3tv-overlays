const latestFollower = nodecg.Replicant('latestFollower');
const latestSub = nodecg.Replicant('latestSub');
const latestDonation = nodecg.Replicant('latestDonation');

latestFollower.on('change', newValue => {
	updateText('dispFollower', newValue.name);
});

latestSub.on('change', newValue => {
	updateText('dispSub', `${newValue.name} - ${newValue.months} ${newValue.months === 1 ? 'month' : 'months'}`);
});

latestDonation.on('change', newValue => {
	//what is this anyways
	updateText('dispDonator', `${newValue.name} - ${newValue.amount} ${newValue.type === 'streamlabs' ? '' : newValue.amount == 1 ? 'bit' : 'bits'}`);
});

function updateText(className, newValue) {
	document.querySelector(`.${className}`).innerText = newValue;
}

const alertOrder = nodecg.Replicant('alertOrder', {defaultValue: 0});

alertOrder.on('change', newValue => {
	disableAlertOption(newValue);
});

const alertButtons = [
	document.querySelector('.alertsNormal'),
	document.querySelector('.alertsReverse')
];

for (let i = 0; i < alertButtons.length; i++) {
	alertButtons[i].onclick = () => { alertOrder.value = i };
};

function disableAlertOption(position) {
	for (let i = 0; i < alertButtons.length; i++) {
		alertButtons[i].disabled = false;
	}
	alertButtons[position].disabled = true;
};

const alignButtons = [
	document.querySelector('.alertsLeft'),
	document.querySelector('.alertsRight')
];

const alertAlign = nodecg.Replicant('alertAlign', {defaultValue: 0});

alertAlign.on('change', newValue => {
	disableAlertAlign(newValue);
});

for (let i = 0; i < alignButtons.length; i++) {
	alignButtons[i].onclick = () => { alertAlign.value = i };
};

function disableAlertAlign(position) {
	for (let i = 0; i < alignButtons.length; i++) {
		alignButtons[i].disabled = false;
	}
	alignButtons[position].disabled = true;
};