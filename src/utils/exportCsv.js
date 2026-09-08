export function exportCsv(filename, headers, rows) {
  if (!rows.length) {
    return false;
  }

  const escapeValue = (value) => {
    const safeValue = String(value ?? '').replace(/\r?\n/g, ' ');
    return /[",]/.test(safeValue) ? `"${safeValue.replace(/"/g, '""')}"` : safeValue;
  };

  const csvContent = [
    headers.map(escapeValue).join(','),
    ...rows.map((row) => row.map(escapeValue).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
