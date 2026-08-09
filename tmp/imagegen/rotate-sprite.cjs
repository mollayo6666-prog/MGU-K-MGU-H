const sharp = require("sharp");

async function main() {
  const input = process.argv[2];
  const output = process.argv[3];
  await sharp(input).rotate(90).png().toFile(output);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
