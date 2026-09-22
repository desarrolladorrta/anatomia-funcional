import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cases = [
  [
    "lanzamiento-sobre-cabeza",
    "an adult university athlete performing an overhead medicine-ball throw, full body in a clear preparation-to-release pose, shoulders and upper limbs unobstructed",
  ],
  [
    "salto-aterrizaje",
    "an adult university athlete landing from a vertical jump, full body, knees and hips flexed in a controlled athletic landing, both lower limbs completely visible",
  ],
  [
    "proteccion-torax",
    "an adult university athlete receiving a soft padded training-ball impact against the front of the chest, nonviolent sports drill, torso and rib-cage region clearly visible, arms slightly open",
  ],
  [
    "postura-tronco",
    "an adult university athlete standing in neutral anatomical posture from a three-quarter side view, full body, upright aligned head spine pelvis and rib cage, balanced weight distribution",
  ],
];

const outputDirectory = path.resolve("assets", "movement-cases");
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const quality = process.env.OPENAI_IMAGE_QUALITY || "medium";
const concurrency = Math.max(1, Math.min(4, Number(process.env.IMAGE_CONCURRENCY) || 2));
const force = process.argv.includes("--force");

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
await mkdir(outputDirectory, { recursive: true });

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generate([slug, subject]) {
  const imagePath = path.join(outputDirectory, `${slug}.webp`);
  if (!force && await exists(imagePath)) {
    console.log(`Skipping ${slug}`);
    return;
  }

  const prompt = `Functional anatomy movement plate for an undergraduate course. Show ${subject}. Realistic human biomechanics and believable joint alignment, modest fitted university training clothes, subject completely inside frame, no cropped limbs. Place the athlete in a controlled clinical motion-analysis studio with a deep desaturated navy background, subtle cyan measurement marks near the frame edges, soft directional examination light, premium sports-science photography, square composition. The pose and body region must be easy to inspect, but do not reveal which bones are correct. No text, no labels, no letters, no numbers, no arrows, no highlighted bones, no x-ray overlay, no exposed anatomy, no blood, no injury, no crowd, no equipment clutter, no UI, no border.`;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, prompt, size: "1024x1024", quality, output_format: "webp" }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${slug}: ${payload.error?.message || response.statusText}`);
  await writeFile(imagePath, Buffer.from(payload.data[0].b64_json, "base64"));
  await writeFile(`${imagePath}.json`, JSON.stringify({ prompt, model, quality, createdAt: new Date().toISOString() }, null, 2));
  console.log(`Generated ${slug}`);
}

let cursor = 0;
async function worker() {
  while (cursor < cases.length) {
    const movementCase = cases[cursor];
    cursor += 1;
    await generate(movementCase);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
