export type CONNECTION_STATUS = "connected" | "disconnected";

export const connectionStatusItem = storage.defineItem<CONNECTION_STATUS>(
    "local:connection_status",
    {
        fallback: "disconnected",
    },
);

export const enabledItem = storage.defineItem<boolean>("local:enabled", {
    fallback: true,
});

export const volumeItem = storage.defineItem<number>("local:volume", {
    fallback: 0.8,
});

export const repeatIntervalMsItem = storage.defineItem<number>("local:repeatIntervalMs", {
    fallback: 5000,
});
