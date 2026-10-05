"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false — під час серверного рендеру і гідратації; true — після неї та для
// компонентів, змонтованих уже на клієнті. useSyncExternalStore, а не
// глобальний прапорець: під час гідратації React для КОЖНОГО компонента бере
// getServerSnapshot, тож результат збігається з сервером незалежно від того,
// в якому порядку гідратуються Suspense-блоки сторінки.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
