import { motion } from "framer-motion";
import showcaseImg from "@/assets/images/hero-transition.jpeg";

export function Showcase() {
  return (
    <section
      aria-label="Imagem institucional do CVI Amazonas"
      className="relative bg-white py-20 lg:py-28 overflow-hidden"
    >
      {/* Glow ambiente de fundo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(15, 168, 189, 0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <motion.figure
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="showcase-frame group relative"
        >
          {/* Borda orbital animada (conic gradient girando atrás da imagem) */}
          <div
            aria-hidden="true"
            className="showcase-orbit absolute -inset-1 rounded-3xl"
          />

          {/* Brilho lateral ambiente */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary-300/30 via-transparent to-secondary-300/20 blur-3xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700"
          />

          {/* Molduras geométricas dos cantos */}
          <div
            aria-hidden="true"
            className="showcase-corner showcase-corner-tl absolute -top-5 -left-5 sm:-top-6 sm:-left-6 h-20 w-20 sm:h-28 sm:w-28 border-t-4 border-l-4 border-primary-600 z-20 transition-all duration-500"
          />
          <div
            aria-hidden="true"
            className="showcase-corner showcase-corner-br absolute -bottom-5 -right-5 sm:-bottom-6 sm:-right-6 h-20 w-20 sm:h-28 sm:w-28 border-b-4 border-r-4 border-primary-600 z-20 transition-all duration-500"
          />

          {/* Container da imagem */}
          <div className="showcase-image relative rounded-2xl overflow-hidden shadow-elevated transition-transform duration-700 ease-out z-10">
            <img
              src={showcaseImg}
              alt="Atendimento e cuidado humanizado no CVI Amazonas"
              className="w-full h-auto object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />

            {/* Gleam — varredura de luz no hover */}
            <div
              aria-hidden="true"
              className="showcase-gleam absolute inset-0 pointer-events-none"
            />

            {/* Vinheta superior leve */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-16 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
              }}
            />
          </div>
        </motion.figure>
      </div>

      <style>{`
        /* Borda orbital — conic gradient girando */
        .showcase-orbit {
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 200deg,
            #0fa8bd 280deg,
            #34d399 320deg,
            transparent 360deg
          );
          animation: showcase-spin 6s linear infinite;
          opacity: 0.55;
          filter: blur(2px);
        }

        .showcase-frame:hover .showcase-orbit {
          opacity: 0.95;
          animation-duration: 3s;
        }

        @keyframes showcase-spin {
          to { transform: rotate(360deg); }
        }

        /* Lift no hover — eleva a imagem sutilmente */
        .showcase-frame:hover .showcase-image {
          transform: translateY(-6px);
          box-shadow: 0 30px 60px -20px rgba(15, 23, 42, 0.25);
        }

        /* Cantos crescem e mudam cor no hover */
        .showcase-frame:hover .showcase-corner-tl {
          transform: translate(-4px, -4px);
          border-color: #34d399;
        }
        .showcase-frame:hover .showcase-corner-br {
          transform: translate(4px, 4px);
          border-color: #34d399;
        }

        /* Gleam — luz que atravessa diagonalmente no hover */
        .showcase-gleam {
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 70%
          );
          transform: translateX(-100%);
          transition: transform 1.1s ease-out;
        }
        .showcase-frame:hover .showcase-gleam {
          transform: translateX(100%);
        }

        /* Acessibilidade: respeita prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .showcase-orbit { animation: none; opacity: 0.3; }
          .showcase-frame:hover .showcase-image { transform: none; }
          .showcase-frame:hover .showcase-corner-tl,
          .showcase-frame:hover .showcase-corner-br { transform: none; }
          .showcase-gleam { display: none; }
        }
        html[data-motion="off"] .showcase-orbit { animation: none; opacity: 0.3; }
        html[data-motion="off"] .showcase-frame:hover .showcase-image { transform: none; }
        html[data-motion="off"] .showcase-gleam { display: none; }
      `}</style>
    </section>
  );
}
