import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const specimens = [
  ["femur", "a complete adult human femur, anterior view, femoral head and distal condyles fully visible"],
  ["esternon", "a complete adult human sternum, anterior view, manubrium body and xiphoid process clearly visible"],
  ["escapula", "a complete adult human scapula, posterior view, spine acromion and glenoid cavity clearly visible"],
  ["vertebra-lumbar", "a single adult human lumbar vertebra, superior oblique view, body vertebral foramen and processes clearly visible"],
  ["humero", "a complete adult human humerus, anterior view, head shaft trochlea and capitulum clearly visible"],
  ["costilla", "a single adult human typical rib, oblique view, head neck tubercle angle and shaft clearly visible"],
  ["mandibula", "a complete adult human mandible, anterior three-quarter view, body ramus condyles and teeth sockets clearly visible"],
  ["tibia", "a complete adult human tibia, anterior view, tibial plateau shaft and medial malleolus clearly visible"],
  ["clavicula", "a complete adult human clavicle, superior view, its natural S curve and both ends clearly visible"],
  ["sacro", "a complete adult human sacrum, anterior pelvic view, fused segments foramina base and apex clearly visible"],
  ["radio", "a complete adult human radius, anterior view, head neck tuberosity shaft and styloid process clearly visible"],
  ["occipital", "an isolated adult human occipital bone, inferior-posterior view, foramen magnum and occipital condyles clearly visible"],
  ["ulna", "a complete adult human ulna, anterior view, olecranon trochlear notch shaft and styloid process clearly visible"],
  ["patela", "a complete adult human patella, anterior view, triangular body base and apex clearly visible"],
  ["fibula", "a complete adult human fibula, lateral view, head slender shaft and lateral malleolus clearly visible"],
  ["carpos", "the complete set of eight adult human carpal bones arranged in correct anatomical wrist position, palmar view, each small bone distinct but presented as one grouped specimen"],
  ["metacarpos", "the complete set of five adult human metacarpal bones arranged in correct anatomical hand position, dorsal view, bases shafts and heads clearly visible, no phalanges or carpal bones"],
];

const outputDirectory = path.resolve("assets", "bones");
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const quality = process.env.OPENAI_IMAGE_QUALITY || "medium";
const concurrency = Math.max(1, Math.min(4, Number(process.env.IMAGE_CONCURRENCY) || 3));
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

  const prompt = `Scientific anatomy specimen plate for an undergraduate functional anatomy course. Show ${subject}. Anatomically accurate real bone morphology, isolated as one museum specimen, centered and completely inside the frame, ivory bone color, subtle natural surface texture, soft clinical top light, deep desaturated navy instrument-tray background, faint stainless steel measurement ticks near the frame edges, premium medical atlas photography, square composition. No other bones, no body silhouette, no hands, no organs, no muscles, no blood, no labels, no letters, no numbers, no arrows, no UI, no border.`;
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
  while (cursor < specimens.length) {
    const specimen = specimens[cursor];
    cursor += 1;
    await generate(specimen);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
