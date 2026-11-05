/**
 * Caminho da busca (`/empresas`) e do perfil (`/empresas/:cnpj`). Fica fora do componente de busca,
 * que carrega sob demanda, para a casca do app ler a rota sem trazê-lo para o pacote inicial.
 */
export const COMPANIES_PATH = '/empresas';
