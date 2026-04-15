import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Servicos } from "@/pages/Servicos";
import { Galeria } from "@/pages/Galeria";
import { Privacidade } from "@/pages/Privacidade";
import { Brandbook } from "@/pages/Brandbook";
import { CookieConsent } from "@/components/layout/CookieConsent";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/brandbook" element={<Brandbook />} />
      </Routes>
      <CookieConsent />
    </>
  );
}

export default App;
