"use client";

import { useEffect, useState } from "react";

let appHydrated = false;

// Чи анімувати появу компонента. Motion рендерить initial-стилі (opacity: 0)
// прямо в серверний HTML — тоді контент першого завантаження лишався б
// невидимим до гідратації (гірший LCP). Тому:
//  - серверний рендер і перша гідратація → false (контент видно одразу);
//  - усе, що монтується пізніше (навігація, infinite scroll, нові фільтри) → true.
export function useMountAnimation() {
  const [shouldAnimate] = useState(() => appHydrated);
  useEffect(() => {
    appHydrated = true;
  }, []);
  return shouldAnimate;
}
