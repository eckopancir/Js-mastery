import deleteSound from "../sound/melee.mp3";
import levelUpSound from "../sound/craft4.mp3";
import levelDownSound from "../sound/install.mp3";
import runSound from "../sound/off.mp3";
import moveEndSound from "../sound/scroll.mp3";
import clickSound from "../sound/clickbutton.mp3";
import headshotSound from "../sound/headshot.wav";
import holyshitSound from "../sound/holyshit.wav";
import multikillSound from "../sound/multikill.wav";
import prepareSound from "../sound/prepare.wav";
import rampageSound from "../sound/rampage.wav";
import oneandonlySound from "../sound/oneandonly.wav";
import maytheforceSound from "../sound/maytheforce.wav";
import monsterkillSound from "../sound/monsterkill.wav";
import humiliationSound from "../sound/humiliation.wav";
import godlikeSound from "../sound/godlike.wav";
import ultrakillSound from "../sound/ultrakill.wav";
import killingspreeSound from "../sound/killingspree.wav";

const soundsMap = {
  delete: deleteSound,
  levelUp: levelUpSound,
  levelDown: levelDownSound,
  run: runSound,
  moveEnd: moveEndSound,
  click: clickSound,
  success: runSound,
  error: deleteSound,
  combo10: headshotSound,
  combo20: holyshitSound,
  combo30: multikillSound,
  combo40: prepareSound,
  combo50: rampageSound,
  combo60: oneandonlySound,
  combo70: maytheforceSound,
  combo80: monsterkillSound,
  combo90: humiliationSound,
  combo100: godlikeSound,
};

const audioCache = {};

export const playSound = (soundKey) => {
  const url = soundsMap[soundKey];
  if (!url) return;

  if (!audioCache[soundKey]) {
    const audio = new Audio(url);
    audio.volume = 0.1;
    audioCache[soundKey] = audio;
  }

  const audio = audioCache[soundKey];
  audio.currentTime = 0;
  audio
    .play()
    .catch((e) => console.warn("Sound blocked by browser policy:", e));
};
