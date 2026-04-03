export const SHEET_ID = "1Sif0L-sJn1TFfX-QcdqvHbUn8EGZP3UKtFrK9BTyNFU";
export const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=0&tqx=out:json`;

function normalizeKey(key = "") {
  return String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseGvizResponse(text) {
  const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s)?.[1];
  if (!jsonText) throw new Error("Could not parse Google Visualization response.");
  const parsed = JSON.parse(jsonText);
  const cols = parsed.table.cols.map((col, i) =>
    normalizeKey(col.label || col.id || `col_${i}`)
  );
  return parsed.table.rows.map((row) => {
    const record = {};
    cols.forEach((colName, i) => {
      const cell = row.c?.[i];
      record[colName] = cell?.f ?? cell?.v ?? "";
    });
    return record;
  });
}
