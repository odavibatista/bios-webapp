/** Arquivo da API com o nome indicado por Content-Disposition (UC09). */
export interface ExportedFile {
  blob: Blob;
  filename: string;
}

/** Aceita somente o nome de XLSX emitido pelo BIOS, sem caminhos ou caracteres de controle. */
export function filenameFromDisposition(disposition: string | undefined): string {
  const filename = /(?:^|;)\s*filename="?([^";]+)"?/i.exec(disposition ?? '')?.[1];

  if (!filename || !/^empresas-bios-\d{4}-\d{2}-\d{2}\.xlsx$/.test(filename)) {
    throw new Error('Nome do arquivo XLSX inválido na resposta da API.');
  }

  return filename;
}
