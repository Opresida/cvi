import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const SPLASH_ICON = "https://i.imgur.com/g7O2JhZ.png";

const DURATION = 4000; // 4 segundos

export function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Barra de progresso animada
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          aria-live="polite"
          aria-label="Carregando CVI Amazonas"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #053c47 0%, #0a7688 40%, #0d94a7 100%)",
            overflow: "hidden",
          }}
        >
          {/* Ondas decorativas (eco do hero — Rio Amazonas) */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              opacity: 0.12,
              overflow: "hidden",
            }}
          >
            <svg
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ width: "200%", height: "100%", position: "absolute", bottom: 0 }}
            >
              <path
                fill="white"
                d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,218.7C672,224,768,192,864,181.3C960,171,1056,181,1152,192C1248,203,1344,213,1392,218.7L1440,224V320H0Z"
                style={{ animation: "splash-wave 6s ease-in-out infinite" }}
              />
              <path
                fill="white"
                fillOpacity="0.5"
                d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224V320H0Z"
                style={{ animation: "splash-wave 8s ease-in-out infinite reverse" }}
              />
            </svg>
          </div>

          {/* Partículas flutuantes */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: [0, 0.4, 0],
                y: [-20, -80 - i * 15],
                x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 8)],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: `${6 + i * 2}px`,
                height: `${6 + i * 2}px`,
                borderRadius: "50%",
                background: "white",
                top: `${50 + i * 5}%`,
                left: `${30 + i * 8}%`,
              }}
            />
          ))}

          {/* Anel orbital girando ao redor do logo */}
          <div style={{ position: "relative", marginBottom: "2rem" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-20px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.15)",
                borderTopColor: "rgba(255,255,255,0.7)",
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-35px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                borderBottomColor: "rgba(255,255,255,0.35)",
              }}
            />

            {/* Ícone girando sentido horário */}
            <motion.img
              src={SPLASH_ICON}
              alt=""
              aria-hidden="true"
              initial={{ scale: 0.7, opacity: 0, rotate: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: 360 }}
              transition={{
                scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              }}
              style={{
                width: "90px",
                height: "90px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 24px rgba(255,255,255,0.3))",
              }}
            />
          </div>

          {/* Texto institucional */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ textAlign: "center", position: "relative", zIndex: 2 }}
          >
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: "1.5rem",
                color: "white",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            >
              CVI Amazonas
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Centro de Vida Independente
            </p>
          </motion.div>

          {/* Barra de progresso com cadeirante */}
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(280px, 75vw)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              zIndex: 2,
            }}
          >
            {/* Container da animação */}
            <div style={{ width: "100%", position: "relative", height: "40px" }}>
              {/* Silhueta: pessoa empurrando criança na cadeira de rodas */}
              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: `calc(${progress * 100}% - ${progress * 48}px)`,
                  filter: "drop-shadow(0 0 6px rgba(255,255,255,0.3))",
                }}
              >
                <svg
                  width="48"
                  height="36"
                  viewBox="0 0 60 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Cadeira de rodas (frente — vai primeiro) */}
                  <path d="M28 20 L28 30 L14 30" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="14" y1="30" x2="11" y2="36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Roda grande (traseira — atrás da cadeira) */}
                  <circle cx="28" cy="34" r="6" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" />
                  <circle cx="28" cy="34" r="1.5" fill="rgba(255,255,255,0.6)" />
                  {/* Roda pequena (dianteira — frente da cadeira) */}
                  <circle cx="12" cy="37" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none" />
                  {/* Encosto */}
                  <line x1="28" y1="20" x2="28" y2="14" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />

                  {/* Criança sentada (na cadeira) */}
                  <circle cx="24" cy="12" r="4" fill="rgba(255,255,255,0.85)" />
                  <line x1="24" y1="16" x2="24" y2="24" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="24" y1="24" x2="20" y2="30" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Acompanhante (atrás — empurrando) */}
                  <circle cx="44" cy="6" r="4" fill="rgba(255,255,255,0.85)" />
                  <line x1="44" y1="10" x2="44" y2="24" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" />
                  {/* Braços estendidos pra frente (segurando alça) */}
                  <line x1="44" y1="15" x2="36" y2="17" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="44" y1="15" x2="34" y2="16" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Pernas caminhando */}
                  <line x1="44" y1="24" x2="40" y2="34" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="44" y1="24" x2="48" y2="34" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Alça (conecta mãos à cadeira) */}
                  <line x1="28" y1="14" x2="34" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>

            {/* Trilha */}
            <div
              style={{
                width: "100%",
                height: "3px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.15)",
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: "4px",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
                  width: `${progress * 100}%`,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.1em",
              }}
            >
              Reabilitação · Inclusão · Autonomia
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
