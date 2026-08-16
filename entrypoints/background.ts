import { connectionStatusItem } from "@/utils/settings";
import type { CONNECTION_STATUS } from "@/utils/settings";

export default defineBackground(async () => {
    let connectionStatus = await connectionStatusItem.getValue();
    let consecutiveErrors = 0;
    let consecutiveSuccesses = 0;

    browser.webRequest.onErrorOccurred.addListener(
        async (details) => {
            // console.log("CONNECTION_LOST - details: ", details);
            consecutiveErrors++;
            consecutiveSuccesses = 0;

            if (consecutiveErrors >= 5) {
                console.log("Connection lost.");

                connectionStatus = "disconnected";
                await connectionStatusItem.setValue(connectionStatus);

                updateExtensionBadge(connectionStatus);
            }
        },
        {
            urls: ["https://meet.google.com/*"],
            types: ["xmlhttprequest"],
        },
    );

    browser.webRequest.onCompleted.addListener(
        async (details) => {
            // console.log("CONNECTED - details: ", details);

            consecutiveSuccesses++;
            consecutiveErrors = 0;

            if (consecutiveSuccesses >= 5) {
                console.log("Connection resumed.");
                connectionStatus = "connected";

                await connectionStatusItem.setValue(connectionStatus);
                updateExtensionBadge(connectionStatus);
            }
        },
        {
            urls: ["https://meet.google.com/*"],
            types: ["xmlhttprequest"],
        },
    );

    browser.tabs.onCreated.addListener(updateMeetTabState);
    browser.tabs.onRemoved.addListener(updateMeetTabState);
    browser.tabs.onUpdated.addListener(updateMeetTabState);
});

function updateExtensionBadge(connectionStatus: CONNECTION_STATUS) {
    if (connectionStatus === "disconnected") {
        browser.action.setBadgeText({ text: "OFF" });
        browser.action.setBadgeBackgroundColor({ color: "#ef4444" });
        browser.action.setTitle({
            title: "Google Meet - Connection is lost.",
        });
        return;
    }

    browser.action.setBadgeText({ text: "ON" });
    browser.action.setBadgeBackgroundColor({ color: "#22c55e" });
    browser.action.setTitle({
        title: "Google Meet - Connected.",
    });
}

async function updateMeetTabState() {
    const meetTabs = await browser.tabs.query({
        url: "https://meet.google.com/*",
    });

    if (meetTabs.length === 0) {
        browser.action.setBadgeText({ text: "!" });
        browser.action.setBadgeBackgroundColor({ color: "#A9A9A9" });
        browser.action.setTitle({
            title: "No Google Meet tabs are open.",
        });
        return;
    }

    let connectionStatus = await connectionStatusItem.getValue();
    updateExtensionBadge(connectionStatus);
}
