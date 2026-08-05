export const DEFAULT_PHRASES = ['You lost your network connection'];

export const phrasesItem = storage.defineItem<string[]>('local:phrases', {
  fallback: DEFAULT_PHRASES,
});

export const enabledItem = storage.defineItem<boolean>('local:enabled', {
  fallback: true,
});

export const volumeItem = storage.defineItem<number>('local:volume', {
  fallback: 0.8,
});

export const repeatIntervalMsItem = storage.defineItem<number>('local:repeatIntervalMs', {
  fallback: 5000,
});
