import { type ReactNode, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const TimelineWrapper = ({ children }: { children: ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollToPosition = (positionVw: number) => {
    if (scrollRef.current) {
      const vw = window.innerWidth;
      scrollRef.current.scrollTo({
        left: positionVw * vw,
        behavior: "smooth",
      });
    }
  };

  const handleLeftClick = () => {
    if (!scrollRef.current) return;
    const currentScroll = scrollRef.current.scrollLeft;
    const vw = window.innerWidth;

    if (currentScroll > 0.5 * vw) {
      scrollToPosition(0.35);
    } else {
      scrollToPosition(0);
    }
  };

  const handleRightClick = () => {
    if (!scrollRef.current) return;
    const currentScroll = scrollRef.current.scrollLeft;
    const vw = window.innerWidth;

    if (currentScroll < 0.2 * vw) {
      scrollToPosition(0.35);
    } else {
      scrollToPosition(1.0);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const sl = scrollRef.current.scrollLeft;
      const sw = scrollRef.current.scrollWidth;
      const cw = scrollRef.current.clientWidth;

      setShowLeftArrow(sl > 10);
      setShowRightArrow(sl < sw - cw - 10);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const vw = window.innerWidth;
      scrollRef.current.scrollLeft = 0.35 * vw;
      handleScroll();
    }
  }, []);

  return (
    <div className="group relative h-[calc(100vh-90px)] w-full overflow-hidden border border-gray-300">
      <button
        onClick={handleLeftClick}
        className={`absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white ${
          showLeftArrow
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-10 opacity-0"
        }`}
        aria-label="Posunout doleva"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>

      <button
        onClick={handleRightClick}
        className={`absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white ${
          showRightArrow
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-10 opacity-0"
        }`}
        aria-label="Posunout doprava"
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </div>
  );
};

export const HistorySlot = ({ children }: { children: ReactNode }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollContainerRef}
      className="from-bg relative w-[70vw] flex-shrink-0 snap-start overflow-x-auto border border-r bg-gradient-to-l to-blue-400/20"
      dir="rtl"
    >
      <Badge
        className={
          "absolute top-4 left-1/2 z-20 -translate-x-1/2 px-2 text-xl font-semibold"
        }
      >
        Historie
      </Badge>

      <div
        className="flex h-full w-max min-w-full items-center justify-end gap-4"
        dir="ltr"
      >
        {children}
      </div>
    </div>
  );
};

export const CurrentSlot = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative z-20 flex w-[30vw] flex-shrink-0 snap-center flex-col items-center justify-center">
      {children}
    </div>
  );
};

export const FutureSlot = ({ children }: { children: ReactNode }) => {
  return (
    <div className="from-bg relative w-[70vw] flex-shrink-0 snap-start border border-l bg-gradient-to-r to-primary/20 p-4">
      <Badge
        className={
          "absolute top-4 left-1/2 z-20 -translate-x-1/2 px-2 text-xl font-semibold"
        }
      >
        Budoucnost
      </Badge>
      <div className="h-full w-full snap-y snap-mandatory overflow-y-auto">
        <div className="flex flex-col justify-start space-y-[40vh] py-[45vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const FutureItemSlot = ({ children }: { children: ReactNode }) => {
  return <div className="shrink-0 snap-center">{children}</div>;
};