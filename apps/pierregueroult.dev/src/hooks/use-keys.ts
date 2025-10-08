import { useCallback, useEffect, useRef, useState } from 'react';

type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';

interface HotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enableOnFormTags?: boolean;
  enableOnContentEditable?: boolean;
  keyEvent?: 'keydown' | 'keyup';
  target?: HTMLElement | Document | Window;
}

interface ParsedHotkey {
  key: string;
  modifiers: Set<ModifierKey>;
}

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const MODIFIER_KEYS: Record<string, ModifierKey> = {
  control: 'ctrl',
  ctrl: 'ctrl',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
};

const KEY_ALIASES: Record<string, string> = {
  esc: 'Escape',
  escape: 'Escape',
  enter: 'Enter',
  return: 'Enter',
  space: ' ',
  spacebar: ' ',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  del: 'Delete',
  delete: 'Delete',
  backspace: 'Backspace',
  tab: 'Tab',
};

function parseHotkey(hotkey: string): ParsedHotkey {
  const parts = hotkey
    .toLowerCase()
    .split('+')
    .map((p) => p.trim());
  const modifiers = new Set<ModifierKey>();
  let key = '';

  for (const part of parts) {
    if (part in MODIFIER_KEYS) {
      const modifierKey = MODIFIER_KEYS[part] as ModifierKey;
      modifiers.add(modifierKey);
    } else {
      key = KEY_ALIASES[part] || part;
    }
  }

  return { key, modifiers };
}

function matchesHotkey(event: KeyboardEvent, parsed: ParsedHotkey): boolean {
  const pressedKey = event.key.toLowerCase();
  const targetKey = parsed.key.toLowerCase();

  if (pressedKey !== targetKey) {
    return false;
  }

  const hasCtrl = event.ctrlKey || event.metaKey;
  const hasShift = event.shiftKey;
  const hasAlt = event.altKey;
  const hasMeta = event.metaKey;

  const needsCtrl = parsed.modifiers.has('ctrl');
  const needsShift = parsed.modifiers.has('shift');
  const needsAlt = parsed.modifiers.has('alt');
  const needsMeta = parsed.modifiers.has('meta');

  if (needsCtrl && !hasCtrl) return false;
  if (needsShift && !hasShift) return false;
  if (needsAlt && !hasAlt) return false;
  if (needsMeta && !hasMeta) return false;

  const totalModifiers = parsed.modifiers.size;
  const pressedModifiers = (hasCtrl ? 1 : 0) + (hasShift ? 1 : 0) + (hasAlt ? 1 : 0);

  return pressedModifiers === totalModifiers;
}

function shouldIgnoreEvent(event: KeyboardEvent, options: HotkeyOptions): boolean {
  const target = event.target as HTMLElement;

  if (!options.enableOnFormTags && FORM_TAGS.has(target.tagName)) {
    return true;
  }

  if (!options.enableOnContentEditable && target.isContentEditable) {
    return true;
  }

  return false;
}

export function useHotkeys(
  hotkeys: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {},
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    enableOnFormTags = false,
    enableOnContentEditable = false,
    keyEvent = 'keydown',
    target = typeof document !== 'undefined' ? document : undefined,
  } = options;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const parsedHotkeys = useRef<ParsedHotkey[]>(
    (Array.isArray(hotkeys) ? hotkeys : [hotkeys]).map(parseHotkey),
  );

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const opts: HotkeyOptions = {
        enableOnFormTags,
        enableOnContentEditable,
      };

      if (shouldIgnoreEvent(event, opts)) return;

      const matches = parsedHotkeys.current.some((parsed) => matchesHotkey(event, parsed));

      if (matches) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callbackRef.current(event);
      }
    },
    [enabled, preventDefault, stopPropagation, enableOnFormTags, enableOnContentEditable],
  );

  useEffect(() => {
    if (!enabled || !target) return;

    const eventTarget = target as EventTarget;
    eventTarget.addEventListener(keyEvent, handleKeyEvent as EventListener);

    return () => {
      eventTarget.removeEventListener(keyEvent, handleKeyEvent as EventListener);
    };
  }, [enabled, handleKeyEvent, keyEvent, target]);
}

export function useKeyPress(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options?: HotkeyOptions,
): void {
  useHotkeys(key, callback, options);
}

export function useKeyState(key: string): boolean {
  const [isPressed, setIsPressed] = useState(false);

  const parsed = useRef(parseHotkey(key));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesHotkey(e, parsed.current)) {
        setIsPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (matchesHotkey(e, parsed.current)) {
        setIsPressed(false);
      }
    };

    const handleBlur = () => setIsPressed(false);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [key]);

  return isPressed;
}

export type { HotkeyOptions, ModifierKey };
export { parseHotkey, matchesHotkey };
