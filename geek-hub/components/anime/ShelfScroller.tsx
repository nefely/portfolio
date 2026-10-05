"use client";

import { useRef, useState, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/free-mode";

interface ShelfScrollerProps {
  // Елементи полиці — кожен стає окремим слайдом.
  items: { key: string | number; node: ReactNode }[];
  // Заголовок і посилання полиці — стрілки стоять поруч із ними.
  header: ReactNode;
}

// Горизонтальна полиця на Swiper: перетягування мишкою з інерцією (freeMode),
// свайп на тачскріні, горизонтальний жест тачпада (Mousewheel + forceToAxis —
// звичайне вертикальне колесо НЕ перехоплюється й гортає сторінку).
// Підключено лише ядро і два модулі — без навігації/пагінації Swiper.
export function ShelfScroller({ items, header }: ShelfScrollerProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Swiper шле progress на кожен кадр руху — оновлюємо стан, лише коли межа
  // справді змінилась, тож зайвих рендерів немає.
  const syncEdges = (swiper: SwiperInstance) => {
    const start = swiper.isBeginning;
    const end = swiper.isEnd;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  // Стрілки гортають на кількість видимих карток (одна лишається для орієнтиру).
  const page = (direction: 1 | -1) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const visible = Math.max(1, Math.floor(swiper.slidesPerViewDynamic()) - 1);
    swiper.slideTo(Math.max(0, swiper.activeIndex + direction * visible));
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">{header}</div>
        <div className="hidden shrink-0 gap-1 sm:flex">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Scroll left"
            disabled={edges.start}
            onClick={() => page(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Scroll right"
            disabled={edges.end}
            onClick={() => page(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="relative -mx-4 sm:-mx-6">
        {/* Відступи країв і між картками — CSS (padding контейнера, pr слайда),
            а не slidesOffset/spaceBetween: ті ставить JS, і до гідратації картки
            стояли б упритул, а потім "стрибали". Вертикальний padding — щоб
            рамки й зсув анімації появи не обрізались overflow: hidden. */}
        <Swiper
          modules={[FreeMode, Mousewheel]}
          slidesPerView="auto"
          freeMode={{ enabled: true, momentumRatio: 0.6 }}
          mousewheel={{ forceToAxis: true }}
          grabCursor
          watchOverflow
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            syncEdges(swiper);
          }}
          onProgress={syncEdges}
          onResize={syncEdges}
          className="px-4! pt-1! pb-3! sm:px-6!"
        >
          {items.map(({ key, node }) => (
            <SwiperSlide key={key} className="w-auto! pr-4">
              {node}
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Затемнення країв підказує, що далі є ще картки. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent transition-opacity",
            edges.start && "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-background to-transparent transition-opacity",
            edges.end && "opacity-0",
          )}
        />
      </div>
    </>
  );
}
