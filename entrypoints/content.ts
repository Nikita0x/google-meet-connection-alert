import {
  enabledItem,
  phrasesItem,
  repeatIntervalMsItem,
  volumeItem,
} from '@/utils/settings';

export default defineContentScript({
  matches: ['*://meet.google.com/*'],
  runAt: 'document_idle',
  main() {
    let phrases: string[] = [];
    let enabled = true;
    let volume = 0.8;
    let repeatIntervalMs = 5000;

    let isDisconnected = false;
    let repeatTimer: ReturnType<typeof setInterval> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const playBeep = () => {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      [0, 0.25, 0.5].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = volume;
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
      setTimeout(() => ctx.close(), 1000);
    };

    const matchesAnyPhrase = (text: string) =>
      phrases.some((phrase) => phrase.trim() && text.includes(phrase));

    const stopRepeating = () => {
      if (repeatTimer !== null) {
        clearInterval(repeatTimer);
        repeatTimer = null;
      }
    };

    const checkForDisconnect = () => {
      if (!enabled || phrases.length === 0) return;

      const nowDisconnected = matchesAnyPhrase(document.body.innerText);

      if (nowDisconnected && !isDisconnected) {
        isDisconnected = true;
        playBeep();
        stopRepeating();
        if (repeatIntervalMs > 0) {
          repeatTimer = setInterval(playBeep, repeatIntervalMs);
        }
      } else if (!nowDisconnected && isDisconnected) {
        isDisconnected = false;
        stopRepeating();
      }
    };

    const scheduleCheck = () => {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkForDisconnect, 400);
    };

    const loadSettings = async () => {
      [phrases, enabled, volume, repeatIntervalMs] = await Promise.all([
        phrasesItem.getValue(),
        enabledItem.getValue(),
        volumeItem.getValue(),
        repeatIntervalMsItem.getValue(),
      ]);
    };

    phrasesItem.watch((value) => {
      phrases = value;
    });
    enabledItem.watch((value) => {
      enabled = value;
      if (!enabled) {
        isDisconnected = false;
        stopRepeating();
      }
    });
    volumeItem.watch((value) => {
      volume = value;
    });
    repeatIntervalMsItem.watch((value) => {
      repeatIntervalMs = value;
    });

    const observer = new MutationObserver(scheduleCheck);

    loadSettings().then(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      checkForDisconnect();
    });
  },
});
