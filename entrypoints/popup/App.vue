<template>
    <div class="popup">
        <h1>Meet Reconnect Alert</h1>
        <button :class="['toggle', enabled ? 'on' : 'off']" @click="toggle">
            {{ enabled ? "Disable" : "Enable" }} Notifications when Connection is Lost
        </button>
        <p class="status">
            Status: <strong>{{ enabled ? "Enabled" : "Disabled" }}</strong>
        </p>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { enabledItem } from "@/store/settings.store";

const enabled = ref(true);
let unwatch: (() => void) | undefined;

onMounted(async () => {
    enabled.value = await enabledItem.getValue();
    unwatch = enabledItem.watch((value) => {
        enabled.value = value;
    });
});

onUnmounted(() => {
    unwatch?.();
});

const toggle = () => {
    enabledItem.setValue(!enabled.value);
};
</script>

<style scoped>
.popup {
    width: 260px;
    padding: 16px;
    text-align: center;
}

h1 {
    font-size: 15px;
    margin: 0 0 14px;
}

.toggle {
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    line-height: 1.4;
    color: white;
}

.toggle.on {
    background: #22c55e;
}

.toggle.off {
    background: #ef4444;
}

.status {
    margin: 12px 0 0;
    font-size: 12px;
    opacity: 0.7;
}
</style>
