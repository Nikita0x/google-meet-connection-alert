import { enabledItem } from '@/utils/settings';

export default defineBackground(() => {
  const COLOR_ON = '#22c55e';
  const COLOR_OFF = '#ef4444';
  const COLOR_INACTIVE_TAB = '#9ca3af';

  const isMeetUrl = (url?: string) => !!url && url.startsWith('https://meet.google.com/');

  const updateBadgeForTab = async (tabId: number) => {
    let tab: Browser.tabs.Tab;
    try {
      tab = await browser.tabs.get(tabId);
    } catch {
      return;
    }

    if (!isMeetUrl(tab.url)) {
      await browser.action.setBadgeBackgroundColor({ color: COLOR_INACTIVE_TAB });
      await browser.action.setBadgeText({ text: '' });
      return;
    }

    const enabled = await enabledItem.getValue();
    await browser.action.setBadgeBackgroundColor({ color: enabled ? COLOR_ON : COLOR_OFF });
    await browser.action.setBadgeText({ text: enabled ? 'ON' : 'OFF' });
  };

  const updateActiveTabBadge = async () => {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id !== undefined) {
      await updateBadgeForTab(activeTab.id);
    }
  };

  browser.tabs.onActivated.addListener(({ tabId }) => {
    updateBadgeForTab(tabId);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete' || changeInfo.url) {
      updateBadgeForTab(tabId);
    }
  });

  browser.windows.onFocusChanged.addListener(() => {
    updateActiveTabBadge();
  });

  enabledItem.watch(() => {
    updateActiveTabBadge();
  });

  updateActiveTabBadge();
});
