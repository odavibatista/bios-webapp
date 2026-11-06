import { vi } from 'vitest';

// O primeiro teste de cada arquivo com gráfico carrega o ECharts sob demanda. Com os workers
// disputando a máquina, isso passa dos 5 s padrão, sem nada de errado na tela.
vi.setConfig({ testTimeout: 15_000 });
