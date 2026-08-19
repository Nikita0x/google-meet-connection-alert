<template>
    <div class="popup">
        <h1>Google Meet Connection Alert</h1>
        <!-- <button :class="['toggle', enabled ? 'on' : 'off']" @click="toggle">
            {{ enabled ? "Disable" : "Enable" }} Notifications when Connection is Lost
        </button> -->
        <p class="status">
            Status: <strong>{{ status === "connected" ? "Connected" : "Disconnected" }}</strong>
        </p>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { connectionStatusItem, getConnectionStatus } from "@/store/settings.store";
import type { CONNECTION_STATUS } from "@/store/settings.store";

const status = ref<CONNECTION_STATUS>("disconnected");

connectionStatusItem.watch((value) => {
    status.value = value;
});

onMounted(async () => {
    status.value = await getConnectionStatus();
});
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
