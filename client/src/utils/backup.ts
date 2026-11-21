const MAX_BACKUP_SIZE = 10 * 1024 * 1024;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readJsonFile(file: File): Promise<unknown> {
  if (file.size > MAX_BACKUP_SIZE) {
    throw new Error('Файл завеликий. Максимальний розмір — 10 МБ.');
  }

  const text = await file.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Не вдалося прочитати JSON-файл.');
  }
}
