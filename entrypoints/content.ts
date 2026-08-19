import {
    // enabledItem,
    repeatIntervalMsItem,
    volumeItem,
    connectionStatusItem,
} from "@/store/settings.store";

export default defineContentScript({
    matches: ["*://meet.google.com/*"],
    runAt: "document_idle",
    main() {
        init();
    },
});

async function init() {
    let [volume, repeatIntervalMs, connectionStatus] = await Promise.all([
        // enabledItem.getValue(),
        volumeItem.getValue(),
        repeatIntervalMsItem.getValue(),
        connectionStatusItem.getValue(),
    ]);

    const audioContext = new AudioContext();
    let intervalID: ReturnType<typeof setInterval> | null = null;

    connectionStatusItem.watch((value) => {
        connectionStatus = value;

        if (connectionStatus === "disconnected") {
            startRepeating();
            return;
        }

        stopRepeating();
        playRestoreSound();
    });

    volumeItem.watch((value) => {
        volume = value;
    });

    // enabledItem.watch((value) => {
    //     enabled = value;
    // });

    repeatIntervalMsItem.watch((value) => {
        repeatIntervalMs = value;
    });

    function playBeep() {
        console.log("beeping...");
        const now = audioContext.currentTime;

        [0, 0.25, 0.5].forEach((offset) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = "sine";
            osc.frequency.value = 880;

            gain.gain.value = volume;

            osc.connect(gain).connect(audioContext.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 0.15);
        });
    }

    function startRepeating() {
        if (intervalID !== null) {
            return;
        }
        intervalID = setInterval(() => {
            playBeep();
        }, repeatIntervalMs);
    }

    function stopRepeating() {
        if (intervalID !== null) {
            clearInterval(intervalID);
            intervalID = null;
        }
    }

    function playRestoreSound() {
        console.log("connection restored...");

        const now = audioContext.currentTime;

        [
            { offset: 0, frequency: 523.25 }, // C5
            { offset: 0.15, frequency: 659.25 }, // E5
            { offset: 0.3, frequency: 783.99 }, // G5
            { offset: 0.45, frequency: 1046.5 }, // C6
        ].forEach(({ offset, frequency }) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = "sine";
            osc.frequency.value = frequency;

            gain.gain.value = volume;

            osc.connect(gain).connect(audioContext.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 0.15);
        });
    }
}
