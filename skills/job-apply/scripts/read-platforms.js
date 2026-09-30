import XLSX from 'xlsx';

/**
 * Expected columns (credentials are intentionally NOT supported here —
 * this tool never reads or stores passwords; log in to each platform
 * yourself in the Chrome profile it launches):
 *   platform_name | url
 */
export function readPlatformsExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  return rows.map((r) => ({
    name: r.platform_name || r.name || r.Platform || '',
    url: r.url || r.URL || r.link || '',
  })).filter((r) => r.url);
}
