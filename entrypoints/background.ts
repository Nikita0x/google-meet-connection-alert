import { getConnectionStatus, setConnectionStatus } from "@/store/settings.store";

export default defineBackground(() => {
    let consecutiveErrors = 0;
    let consecutiveSuccesses = 0;

    browser.webRequest.onErrorOccurred.addListener(
        async (details) => {
            let connectionStatus = await getConnectionStatus();
            consecutiveErrors++;
            consecutiveSuccesses = 0;

            if (consecutiveErrors >= 5 && connectionStatus !== "disconnected") {
                const hasMeet = await hasMeetTabs();

                if (!hasMeet) return;

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
            let connectionStatus = await getConnectionStatus();
            consecutiveSuccesses++;
            consecutiveErrors = 0;

            if (consecutiveSuccesses >= 5 && connectionStatus !== "connected") {
                const hasMeet = await hasMeetTabs();

                if (!hasMeet) return;

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
