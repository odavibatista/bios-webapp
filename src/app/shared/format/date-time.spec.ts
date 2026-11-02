import { formatDateTime } from './date-time';

describe('formatDateTime', () => {
  it.each([
    ['2026-10-30T13:36:35.224Z', '30/10/2026, 10:36'],
    ['2026-10-30T13:14:26.239Z', '30/10/2026, 10:14'],
    // Perto da meia-noite em UTC, o dia em Brasília ainda é o anterior.
    ['2026-11-01T02:30:00.000Z', '31/10/2026, 23:30'],
  ])('%s no horário de Brasília é %s', (iso, expected) => {
    expect(formatDateTime(iso)).toBe(expected);
  });
});
