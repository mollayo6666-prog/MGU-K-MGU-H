const sharp = require("sharp");

async function main() {
  const input = process.argv[2];
  const output = process.argv[3];
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const magentaDominance = Math.min(r, b) - g;
    const keyStrength = Math.max(0, Math.min(1, (magentaDominance - 22) / 105));
    const brightnessGate = Math.max(0, Math.min(1, (Math.min(r, b) - 75) / 135));
    const removal = keyStrength * brightnessGate;
    data[i + 3] = Math.round(255 * (1 - removal));

    if (removal > 0) {
      const neutral = g;
      data[i] = Math.round(r * (1 - removal) + neutral * removal);
      data[i + 2] = Math.round(b * (1 - removal) + neutral * removal);
    }
  }

  await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 512, withoutEnlargement: true })
    .png()
    .toFile(output);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
