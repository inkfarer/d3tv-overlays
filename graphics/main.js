gsap.registerPlugin(TextPlugin);

const nowPlaying = nodecg.Replicant('nowPlaying');
const nowPlayingManual = nodecg.Replicant('nowPlayingManual', {
    defaultValue: {
        artist: undefined,
        song: undefined
    }
});
const musicShown = nodecg.Replicant('musicShown', { defaultValue: true });
const mSongEnabled = nodecg.Replicant('mSongEnabled', { defaultValue: false });

NodeCG.waitForReplicants(mSongEnabled).then(() => {
    nowPlaying.on('change', newValue => {
        if (!mSongEnabled.value) {
            changeSongText(newValue);
        };
    });
    
    nowPlayingManual.on('change', newValue => {
        if (mSongEnabled.value) {
            changeSongText(newValue);
        }
    });
    
    mSongEnabled.on('change', newValue => {
        if (newValue) {
            changeSongText(nowPlayingManual.value);
        } else {
            changeSongText(nowPlaying.value);
        }
    });
});

function changeSongText(songElem) {
    if (!songElem.song && !songElem.artist || songElem.song === '' && songElem.artist === '') {
        changeAlertText('musicText', 'Nothing is playing.');
    } else if (!songElem.song || songElem.song === '') {
        changeAlertText('musicText', songElem.artist);
    } else if (!songElem.artist || songElem.artist === '') {
        changeAlertText('musicText', songElem.song);
    } else {
        changeAlertText('musicText', `${songElem.artist} - ${songElem.song}`);
    }
}

const latestFollower = nodecg.Replicant('latestFollower');
const latestSub = nodecg.Replicant('latestSub');
const latestDonation = nodecg.Replicant('latestDonation');

latestFollower.on('change', newValue => {
    changeAlertText('followText', newValue.name);
});
latestSub.on('change', newValue => {
    changeAlertText('subText', `${newValue.name} - ${newValue.months} ${newValue.months == 1 ? 'month' : 'months'}`);
});
latestDonation.on('change', newValue => {
    changeAlertText('donatorText', `${newValue.name} - ${newValue.amount} ${newValue.type === 'streamlabs' ? '' : newValue.amount == 1 ? 'bit' : 'bits'}`);
});

function changeAlertText(textElemID, newText) {
    const textElem = document.querySelector(`#${textElemID}`);
    const oldText = textElem.getAttribute('text');
    console.log(oldText);
    const BGElem = textElem.parentNode;
    const iconElem = BGElem.parentNode.querySelector('.icon');
    const iconSVG = iconElem.querySelector('svg');
    //difference between old text and new text length
    const textDuration = Math.abs(newText.length - textElem.innerText.length) / 40;
    const animTL = gsap.timeline();
    animTL.add(gsap.to([BGElem, iconElem], {duration: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.6)', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 5px rgba(255, 255, 255, 0.6))'}), 0)
    .add(gsap.to(iconSVG, {duration: 0.5, fill: 'black'}), 0)
    .add(gsap.to(textElem, {duration: 0.5, color: 'black'}), 0)

    .add(gsap.to(textElem, {ease: 'none', duration: textDuration, onUpdate: function() {
        var textLen;
        var substring;
        var oldTextPart;
        if (oldText.length > newText.length) {
            textLen = this.progress() * oldText.length
            oldTextPart = oldText.substring(textLen, oldText.length);
            substring = newText.substring(0, textLen);
        } else {
            textLen = this.progress() * newText.length;
            substring = newText.substring(0, textLen);
            oldTextPart = oldText.substring(textLen, oldText.length);
        }
        textElem.setAttribute('text', substring + oldTextPart);
    }}))

    .add(gsap.to([BGElem, iconElem], {duration: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.6)', filter: 'unset'}), 'c')
    .add(gsap.to(iconSVG, {duration: 0.5, fill: 'white'}), 'c')
    .add(gsap.to(textElem, {duration: 0.5, color: 'white'}), 'c');
};

function measureText(fontFamily, fontSize, text) {
    const measurer = document.createElement('div');
    measurer.classList.add('measurer');
    measurer.style.fontFamily = fontFamily;
    measurer.style.fontSize = fontSize;
    measurer.innerText = text;

    document.body.appendChild(measurer);
    const width = measurer.getBoundingClientRect().width;
    measurer.parentNode.removeChild(measurer);
    return width;
};