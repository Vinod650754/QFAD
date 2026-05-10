import fs from "fs/promises";
import path from "path";

const outDir = path.resolve("../datasets/generated");
const rawFile = path.join(outDir, "opentdb_raw.json");
const amount = Number(process.argv[2] || 50);

const run = async () => {
  await fs.mkdir(outDir, { recursive: true });
  const url = `https://opentdb.com/api.php?amount=${Math.min(amount, 50)}&type=multiple`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Dataset download failed: ${response.status}`);

  const data = await response.json();
  if (data.response_code !== 0) throw new Error(`OpenTDB response_code ${data.response_code}`);

  await fs.writeFile(rawFile, JSON.stringify(data.results, null, 2));
  console.log(`Downloaded ${data.results.length} questions from Open Trivia DB to ${rawFile}`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
