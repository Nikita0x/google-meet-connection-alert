import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-vue"],
    webExt: { disabled: true },
    manifest: {
        permissions: ["storage", "webRequest"],
        host_permissions: ["https://meet.google.com/*"],
    },
});
