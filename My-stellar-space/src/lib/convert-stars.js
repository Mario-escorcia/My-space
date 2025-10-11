import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, "../data/hyg_v42.csv");
const outputFile = path.join(__dirname, "../data/stars.json");

console.log("📦 Leyendo archivo CSV...");

const csvData = fs.readFileSync(inputFile, "utf8");

console.log("🔍 Parseando datos...");
const result = Papa.parse(csvData, {
  header: true,
  dynamicTyping: true,
});

console.log(`🧮 ${result.data.length} filas leídas.`);

const filtered = result.data
  .filter(
    (star) =>
      star.x !== undefined &&
      star.y !== undefined &&
      star.z !== undefined &&
      star.mag !== undefined &&
      star.mag < 8 &&
      star.dist < 200
  )
  .map((star) => ({
    x: star.x,
    y: star.y,
    z: star.z,
    mag: star.mag,
    ci: star.ci ?? 0.4,
    proper: star.proper || "",
  }));

console.log(`✅ ${filtered.length} estrellas procesadas.`);

fs.writeFileSync(outputFile, JSON.stringify(filtered));
console.log(`💾 Guardado en ${outputFile}`);
