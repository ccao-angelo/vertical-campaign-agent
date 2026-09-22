// Calls the AI directly to check API key and prompt
//  npx tsx scripts/try-generate.ts email
//  npx tsx scripts/try-generate.ts social
//  npx tsx scripts/try-generate.ts postcard
import "dotenv/config";
import { EXAMPLE_BRIEF } from "../shared/example";
import { generateAsset } from "../server/lib/generate";

const channel = (process.argv[2] ?? "email") as "email" | "social" | "postcard";
console.log(`Generating a ${channel} asset. This takes 5 to 15 seconds...`);

try {
  const result = await generateAsset({ brief: EXAMPLE_BRIEF, channel });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Generation failed:", error);
  process.exit(1);
}