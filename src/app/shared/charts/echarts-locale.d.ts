// O ECharts publica os idiomas sem tipos.
declare module 'echarts/lib/i18n/langPT-br.js' {
  const locale: Parameters<typeof import('echarts/core').registerLocale>[1];

  export default locale;
}
