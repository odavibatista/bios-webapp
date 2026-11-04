import { DOWNLOAD_URL_REVOKE_DELAY_MS, downloadFile } from './download-file';

describe('downloadFile', () => {
  it('revoga a URL temporária somente após dar tempo ao navegador para iniciar o download', () => {
    vi.useFakeTimers();
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:planilha');
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    try {
      const blob = new Blob(['xlsx']);
      downloadFile(blob, 'empresas.xlsx');

      expect(createUrl).toHaveBeenCalledWith(blob);
      expect(click).toHaveBeenCalledOnce();
      expect(revokeUrl).not.toHaveBeenCalled();
      vi.advanceTimersByTime(DOWNLOAD_URL_REVOKE_DELAY_MS - 1);
      expect(revokeUrl).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(revokeUrl).toHaveBeenCalledExactlyOnceWith('blob:planilha');
      expect(document.querySelector('a[href="blob:planilha"]')).toBeNull();
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });
});
