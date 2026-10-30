/**
 * Tudo o que o mock lê das respostas capturadas, num módulo só: o `MockBiosApi` o importa sob
 * demanda (`import()`), e o build põe as capturas num chunk separado, fora do bundle inicial.
 */
export * from './mock-captures';
export * from './mock-companies';
