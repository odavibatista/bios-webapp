/** Dá tempo ao navegador para iniciar o download antes de liberar a URL temporária. */
export const DOWNLOAD_URL_REVOKE_DELAY_MS = 10_000;

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_REVOKE_DELAY_MS);
}
