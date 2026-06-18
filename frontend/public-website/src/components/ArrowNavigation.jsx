'use client';

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const ArrowNavigation = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  const checkScrollPosition = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 100);
  };

  const handleScroll = () => {
    window.scrollTo({
      top: isAtBottom ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollPosition);
    checkScrollPosition(); // initial check in case page loads scrolled

    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  return (
    <div className="fixed bottom-20 right-8 z-50">
      <button
        onClick={handleScroll}
        aria-label={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
        className="p-3 bg-[#00d9a6] rounded-full cursor-pointer hover:bg-[#00d9a6]/90 transition-all duration-200 shadow-lg"
        type="button"
      >
        {isAtBottom ? (
          <ChevronUp className="h-6 w-6 text-white" />
        ) : (
          <ChevronDown className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default ArrowNavigation;
