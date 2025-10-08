import { useEffect, useState } from 'react';

const BROWSER_ID_KEY = 'browser-id';

function generateUniqueId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  const performanceNow =
    typeof performance !== 'undefined'
      ? performance.now().toString(36)
      : Math.random().toString(36).substring(2);

  return `${timestamp}-${randomPart}-${performanceNow}`;
}

export function useBrowserId(): string {
  const [browserId, setBrowserId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let id = localStorage.getItem(BROWSER_ID_KEY);

    if (!id) {
      id = generateUniqueId();
      localStorage.setItem(BROWSER_ID_KEY, id);
    }

    setBrowserId(id);
  }, []);

  return browserId;
}
