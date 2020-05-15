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