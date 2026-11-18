/**
 * Tema da referência da API com a paleta do BIOS (a mesma do Material, em `styles.scss`), no
 * lugar do tema escuro padrão do Scalar. As fontes são as do próprio app: nada vem de CDN.
 */
export const BIOS_SCALAR_THEME = `
.light-mode, .dark-mode {
  --scalar-font: 'Inter Variable', system-ui, sans-serif;
  --scalar-font-code: ui-monospace, 'Cascadia Code', Consolas, 'Courier New', monospace;
  --scalar-radius: 8px;
  --scalar-radius-lg: 12px;
  --scalar-radius-xl: 14px;

  --scalar-color-1: #1a1a1a;
  --scalar-color-2: #3f4a3f;
  --scalar-color-3: #5b6b5b;
  --scalar-color-accent: #2c5f2d;
  --scalar-color-green: #2c7a3a;
  --scalar-color-red: #b3261e;
  --scalar-color-yellow: #8a5f00;
  --scalar-color-blue: #2f6690;
  --scalar-color-orange: #a65300;
  --scalar-color-purple: #6f4a8e;

  --scalar-background-1: #fbfcf8;
  --scalar-background-2: #f1f5ec;
  --scalar-background-3: #e4ecdc;
  --scalar-background-accent: rgba(44, 95, 45, 0.12);
  --scalar-border-color: #d6e0cf;

  --scalar-button-1: #2c5f2d;
  --scalar-button-1-color: #ffffff;
  --scalar-button-1-hover: #234b24;
  --scalar-link-color: #2c5f2d;
  --scalar-link-color-hover: #1f4220;
  --scalar-focus-color: #2c5f2d;
  --scalar-tooltip-background: #1f3d20;
  --scalar-tooltip-color: #ffffff;
  --scalar-scrollbar-color: rgba(44, 95, 45, 0.35);
  --scalar-scrollbar-color-active: #2c5f2d;

  --scalar-sidebar-background-1: #eef3e8;
  --scalar-sidebar-color-1: #1a1a1a;
  --scalar-sidebar-color-2: #4a584a;
  --scalar-sidebar-border-color: #d6e0cf;
  --scalar-sidebar-item-hover-background: #e0ead6;
  --scalar-sidebar-item-hover-color: #1f4220;
  /* Item ativo em verde claro, e não escuro: o método (GET, POST...) mantém o contraste AA. */
  --scalar-sidebar-item-active-background: #d3e4c6;
  --scalar-sidebar-color-active: #1f4220;
  --scalar-sidebar-indent-border: #c9d6c3;
  --scalar-sidebar-indent-border-hover: #97bc62;
  --scalar-sidebar-indent-border-active: #2c5f2d;
  --scalar-sidebar-search-background: #ffffff;
  --scalar-sidebar-search-border-color: #c9d6c3;
  --scalar-sidebar-search-color: #4a584a;
}

/* O cliente de requisições abre por cima de tudo, inclusive do cabeçalho fixo do BIOS (1000). */
.scalar-app.z-overlay {
  z-index: 1100 !important;
}
`;
