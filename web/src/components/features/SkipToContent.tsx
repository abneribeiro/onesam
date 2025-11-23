/**
 * Link "Pular para conteúdo principal"
 * Aparece apenas quando recebe foco (para navegação por teclado)
 * Melhora acessibilidade permitindo usuários pularem a navegação
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
    >
      Ir para conteúdo principal
    </a>
  );
}
