import deleteSound from '../sound/melee.mp3';
import levelUpSound from '../sound/craft4.mp3';
import levelDownSound from '../sound/install.mp3';
import runSound from '../sound/off.mp3';
import moveEndSound from '../sound/scroll.mp3';
import clickSound from '../sound/clickbutton.mp3';

const soundsMap = {
    delete: deleteSound,
    levelUp: levelUpSound,
    levelDown: levelDownSound,
    run: runSound,
    moveEnd: moveEndSound,
    click: clickSound
};

const audioCache = {};

export const playSound = (soundKey) => {
    const url = soundsMap[soundKey];
    if (!url) return;

    if (!audioCache[soundKey]) {
        audioCache[soundKey] = new Audio(url);
    }

    const audio = audioCache[soundKey];
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Sound blocked by browser policy:', e));
};
