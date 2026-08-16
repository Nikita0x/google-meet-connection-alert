import { getConnectionStatus, setConnectionStatus } from "@/store/settings.store";
import type {
    CONNECTION_EVENT,
    CONNECTION_STATE,
    TransitionFunctions,
} from "@/store/settings.store";

export default defineBackground(() => {
    const initialState: CONNECTION_STATE = {
        status: "disconnected",
        consecutiveErrors: 0,
        consecutiveSuccesses: 0,
    };
    let state = initialState;

    browser.webRequest.onErrorOccurred.addListener(
        async (details) => {
            const hasMeet = await hasMeetTabs();

            if (!hasMeet) return;

            const previousState = state;

            state = transition(state, "request_failed");

            if (previousState.status !== state.status) {
                await setConnectionStatus("disconnected");
                await updateExtensionBadge();
            }
        },
        {
            urls: ["https://meet.google.com/*"],
            types: ["xmlhttprequest"],
        },
    );

    browser.webRequest.onCompleted.addListener(
        async (details) => {
            const hasMeet = await hasMeetTabs();

            if (!hasMeet) return;

            const previousState = state;

            state = transition(state, "request_succeeded");
            if (previousState.status !== state.status) {
                await setConnectionStatus("connected");

                await updateExtensionBadge();
            }
        },
        {
            urls: ["https://meet.google.com/*"],
            types: ["xmlhttprequest"],
        },
    );

    browser.tabs.onCreated.addListener(() => {
        updateMeetTabState();
    });

    browser.tabs.onRemoved.addListener((tabId) => {
        updateMeetTabState();
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
        updateMeetTabState();
    });
});

async function updateExtensionBadge() {
    let connectionStatus = await getConnectionStatus();

    if (connectionStatus === "disconnected") {
        await browser.action.setBadgeText({ text: "OFF" });
        await browser.action.setBadgeBackgroundColor({
            color: "#ef4444",
        });
        await browser.action.setTitle({
            title: "Google Meet - Connection is lost.",
        });

        return;
    }

    await browser.action.setBadgeText({ text: "ON" });
    await browser.action.setBadgeBackgroundColor({
        color: "#22c55e",
    });
    await browser.action.setTitle({
        title: "Google Meet - Connected.",
    });
}

async function updateMeetTabState() {
    const hasMeet = await hasMeetTabs();

    if (!hasMeet) {
        await browser.action.setBadgeText({ text: "!" });

        await browser.action.setBadgeBackgroundColor({
            color: "#A9A9A9",
        });

        await browser.action.setTitle({
            title: "No Google Meet tabs are open.",
        });

        return;
    }

    await updateExtensionBadge();
}

async function hasMeetTabs() {
    const meetTabs = await browser.tabs.query({
        url: "https://meet.google.com/*",
    });

    return meetTabs.length > 0;
}

const transitions: TransitionFunctions = {
    request_succeeded: (state) => {
        const successes = state.consecutiveSuccesses + 1;
        return {
            consecutiveErrors: 0,
            consecutiveSuccesses: successes,
            status: successes >= 5 ? "connected" : state.status,
        };
    },
    request_failed: (state) => {
        const errors = state.consecutiveErrors + 1;
        return {
            consecutiveSuccesses: 0,
            consecutiveErrors: errors,
            status: errors >= 5 ? "disconnected" : state.status,
        };
    },
};

function transition(state: CONNECTION_STATE, event: CONNECTION_EVENT): CONNECTION_STATE {
    return transitions[event](state);
}
