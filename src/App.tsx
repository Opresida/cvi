import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "@/pages/Home";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SplashLoader } from "@/components/layout/SplashLoader";
import { FaceMobile } from "@/pages/FaceMobile";
import { AdminLogin } from "@/pages/admin/Login";
import { Dashboard } from "@/pages/admin/Dashboard";
import { DashboardHome } from "@/pages/admin/DashboardHome";
import { Ponto } from "@/pages/admin/Ponto";
import { Employees } from "@/pages/admin/Employees";
import { Adjustments } from "@/pages/admin/Adjustments";
import { Timesheet } from "@/pages/admin/Timesheet";
import { Vacations } from "@/pages/admin/Vacations";
import { Treatments } from "@/pages/admin/Treatments";
import { Paystubs } from "@/pages/admin/Paystubs";

// Lazy-loaded routes
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
          {/* Site institucional */}
          <Route path="/" element={<Home />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/brandbook" element={<Brandbook />} />

          {/* Reconhecimento facial via QR Code (celular) */}
          <Route path="/face/:sessionId" element={<FaceMobile />} />

          {/* Área administrativa */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="rh/ponto" element={<Ponto />} />
            <Route path="rh/funcionarios" element={<Employees />} />
            <Route path="rh/ajustes" element={<Adjustments />} />
            <Route path="rh/espelho" element={<Timesheet />} />
            <Route path="rh/ferias" element={<Vacations />} />
            <Route path="rh/tratamento" element={<Treatments />} />
            <Route path="rh/contracheques" element={<Paystubs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </>
  );
}

export default App;
