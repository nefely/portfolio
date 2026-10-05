"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShelfScrollerProps {
  children: ReactNode;
  // Заголовок і посилання полиці — стрілки стоять поруч із ними.
  header: ReactNode;
}

// Горизонтальна полиця: нативний scroll-snap (свайп на тачскріні/тачпаді) +
// стрілки для миші, яка інакше не вміє гортати вбік. Колесо не перехоплюємо,
// щоб не ламати вертикальну прокрутку сторінки.
export function ShelfScroller({ children, header }: ShelfScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    // scroll стріляє десятки разів на секунду — рахуємо раз на кадр і
    // оновлюємо стан, лише коли межа справді змінилась (без зайвих рендерів).
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const start = track.scrollLeft <= 4;
        const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
      });
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // Майже ціла видима ширина — одна картка лишається для орієнтиру.
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
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
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Scroll right"
            disabled={edges.end}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="relative -mx-4 sm:-mx-6">
        {/* overflow-x-auto робить і вертикаль прокручуваною (за специфікацією
            CSS), а зсув картки при появі давав переповнення вниз — рядок
            скролився по вертикалі. Звідси явний overflow-y-hidden і вертикальні
            відступи, щоб рамки й тіні карток не обрізались. overscroll-x-contain:
            свайп полиці не вмикає жест "назад" у браузері. */}
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pt-1 pb-3 sm:scroll-px-6 sm:px-6"
        >
          {children}
        </div>
        {/* Затемнення країв підказує, що далі є ще картки. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent transition-opacity",
            edges.start && "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent transition-opacity",
            edges.end && "opacity-0",
          )}
        />
      </div>
    </>
  );
}
