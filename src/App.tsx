import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "@/pages/Home";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SplashLoader } from "@/components/layout/SplashLoader";

// Lazy-loaded routes — só carregam quando o usuário navega pra elas
// Reduz o bundle inicial de ~590KB pra ~350KB
const Servicos = lazy(() =>
  import("@/pages/Servicos").then((m) => ({ default: m.Servicos }))
);
const Galeria = lazy(() =>
  import("@/pages/Galeria").then((m) => ({ default: m.Galeria }))
);
const Privacidade = lazy(() =>
  import("@/pages/Privacidade").then((m) => ({ default: m.Privacidade }))
);
const Brandbook = lazy(() =>
  import("@/pages/Brandbook").then((m) => ({ default: m.Brandbook }))
);
const NotFound = lazy(() =>
  import("@/pages/NotFound").then((m) => ({ default: m.NotFound }))
);

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(145deg, #e6f7f9, #ffffff)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-[3px] border-primary-200"
          style={{
            borderTopColor: "#0a7688",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span className="text-sm font-semibold text-primary-700 tracking-wider uppercase">
          Carregando...
        </span>
      </div>
    </div>
  );
}

function App() {
  const { pathname } = useLocation();
  const showSplash = pathname === "/";

  return (
    <>
      {showSplash && <SplashLoader />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/brandbook" element={<Brandbook />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </>
  );
}

export default App;
