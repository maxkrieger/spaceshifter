import { shuffle } from "lodash";
const trainFile = Bun.file(process.argv[2]);

const text = await trainFile.text();

const splitted = shuffle(text.split("\n"));

const processed = [];
for (let i = 0; i < 2000; i++) {
  const [english, spanish] = splitted[i].split("\t");
  processed.push({
    text_1: english,
    text_2: spanish,
    label: 1,
  });
}

await Bun.write(process.argv[3], JSON.stringify(processed, null, 2));
