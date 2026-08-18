import {
    enabledItem,
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
    let [enabled, volume, repeatIntervalMs, connectionStatus] = await Promise.all([
        enabledItem.getValue(),
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
    });

    volumeItem.watch((value) => {
        volume = value;
    });

    enabledItem.watch((value) => {
        enabled = value;
    });

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
}
