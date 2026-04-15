export function SkipLinks() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <a href="#main-nav" className="skip-link" style={{ left: "15rem" }}>
        Pular para a navegação
      </a>
    </>
  );
}
