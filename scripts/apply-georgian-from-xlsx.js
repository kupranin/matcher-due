/**
 * Apply Georgian translations from an Excel file into messages/ka.json.
 *
 * Supported Excel formats:
 * 1) Columns: key | English | Georgian (header row)
 * 2) First column markdown table: "| key.path | Georgian text |"
 *
 * Run: node scripts/apply-georgian-from-xlsx.js "<path-to-xlsx>"
 * Example: node scripts/apply-georgian-from-xlsx.js "/Users/m3/Downloads/translations_en_ka.xlsx"
 */
const fs = require("fs");
const path = require("path");

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error("Usage: node scripts/apply-georgian-from-xlsx.js <path-to-Georgian.xlsx>");
  process.exit(1);
}
if (!fs.existsSync(xlsxPath)) {
  console.error("File not found:", xlsxPath);
  process.exit(1);
}

let XLSX;
try {
  XLSX = require("xlsx");
} catch (e) {
  console.error("Install xlsx first: npm install xlsx");
  process.exit(1);
}

const kaPath = path.join(__dirname, "../messages/ka.json");

function setByPath(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in current) || typeof current[p] !== "object" || current[p] === null) {
      current[p] = {};
    }
    current = current[p];
  }
  const last = parts[parts.length - 1];
  current[last] = value;
}

// Read Excel
const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

const rows = [];
const header = (data[0] || []).map((c) => String(c).trim().toLowerCase());
const keyCol = header.indexOf("key");
const kaCol = header.findIndex((h) => h === "georgian" || h === "ka" || h === "georgian text");

if (keyCol >= 0 && kaCol >= 0) {
  for (let i = 1; i < data.length; i++) {
    const row = data[i] || [];
    const key = row[keyCol] != null ? String(row[keyCol]).trim() : "";
    const value = row[kaCol] != null ? String(row[kaCol]).trim() : "";
    if (key) rows.push({ key, value });
  }
} else {
  for (const row of data) {
    const cell = row && row[0] ? String(row[0]).trim() : "";
    if (!cell.startsWith("|") || cell.includes("-----")) continue;
    const parts = cell.split("|").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) rows.push({ key: parts[0], value: parts[1] });
  }
}

const ka = JSON.parse(fs.readFileSync(kaPath, "utf-8"));
let applied = 0;
for (const row of rows) {
  const key = row.key && row.key.trim();
  if (!key || key === "Key") continue;
  const value = row.value != null ? String(row.value).trim() : "";
  setByPath(ka, key, value);
  applied++;
}

fs.writeFileSync(kaPath, JSON.stringify(ka, null, 2) + "\n", "utf-8");
console.log("Applied", applied, "Georgian strings from", xlsxPath, "to messages/ka.json");
