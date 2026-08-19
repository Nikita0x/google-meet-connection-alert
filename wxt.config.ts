import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-vue"],
    webExt: { disabled: true },

    manifest: {
        name: "Google Meet Connection Alert",
        description:
            "Get instant sound alerts when your Google Meet connection is lost or restored.",
        version: "1.0.0",
        permissions: ["storage", "webRequest"],
        host_permissions: ["https://meet.google.com/*"],
        // icons: {
        //     16: "icon16.png",
        //     32: "icon32.png",
        //     48: "icon48.png",
        //     128: "icon128.png",
        // },
        // action: {
        //     default_icon: {
        //         16: "icon16.png",
        //         32: "icon32.png",
        //     },
        // },
    },
});
