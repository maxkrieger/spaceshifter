const trainFile = Bun.file(process.argv[2]);

const text = await trainFile.text();

const splitted = text.split("\n");

const processed = [];
for (let i = 0; i < 2000; i++) {
  const parsed = JSON.parse(splitted[i]);
  processed.push({
    text_1: parsed.premise,
    text_2: parsed.hypothesis,
    label: parsed.label === "entailment" ? 1 : -1,
  });
}

await Bun.write(process.argv[3], JSON.stringify(processed, null, 2));
