import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingDonateCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#doar"
      aria-label="Fazer uma doação ao CVI Amazonas"
      className={`fixed z-40 bg-secondary-500 text-white font-semibold shadow-elevated
        transition-all duration-300 hover:bg-secondary-600
        focus-visible:ring-4 focus-visible:ring-secondary-300

        bottom-6 right-6 px-6 py-4 rounded-full gap-2
        hidden sm:inline-flex items-center

        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-secondary-400 animate-ping opacity-40"
        style={{ animationDuration: "2.5s" }}
      />
      <Heart size={20} aria-hidden="true" className="relative" />
      <span className="relative">Doe Agora</span>
    </a>
  );
}
