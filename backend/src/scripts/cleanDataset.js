import fs from "fs/promises";
import path from "path";
import { cleanQuestions } from "../utils/dataset.js";

const input = process.argv[2] || "../datasets/generated/opentdb_raw.json";
const output = process.argv[3] || "../datasets/generated/opentdb_clean.json";

const run = async () => {
  const raw = JSON.parse(await fs.readFile(input, "utf8"));
  const cleaned = cleanQuestions(raw);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(cleaned, null, 2));
  console.log(`Cleaned ${cleaned.length} valid unique questions into ${output}`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
