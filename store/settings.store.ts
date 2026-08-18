export type CONNECTION_STATUS = "connected" | "disconnected";
export type CONNECTION_EVENT = "request_failed" | "request_succeeded";
export type CONNECTION_STATE = {
    status: CONNECTION_STATUS;
    consecutiveErrors: number;
    consecutiveSuccesses: number;
};

export type TransitionFunctions = {
    [K in CONNECTION_EVENT]: (state: CONNECTION_STATE) => CONNECTION_STATE;
};

export const connectionStatusItem = storage.defineItem<CONNECTION_STATUS>(
    "local:connection_status",
    {
        fallback: "disconnected",
    },
);

export function getConnectionStatus() {
    return connectionStatusItem.getValue();
}

export async function setConnectionStatus(status: CONNECTION_STATUS) {
    await connectionStatusItem.setValue(status);
}

export const enabledItem = storage.defineItem<boolean>("local:enabled", {
    fallback: true,
});

export const volumeItem = storage.defineItem<number>("local:volume", {
    fallback: 1,
});

export const repeatIntervalMsItem = storage.defineItem<number>("local:repeatIntervalMs", {
    fallback: 5000,
});
