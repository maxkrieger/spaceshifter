const trainFile = Bun.file(process.argv[2], {
  type: "application/json;charset=utf-8",
});

const trainJson = await trainFile.json();

const processed = [];
for (let i = 0; i < 2000; i++) {
  const item = trainJson[i];
  const question = item.question;
  const supportParagraphNames = new Set(
    item.supporting_facts.map((support) => support[0])
  );
  const positiveParagraphs: string[] = [];
  const negativeParagraphs: string[] = [];
  for (const [title, paragraphs] of item.context) {
    if (supportParagraphNames.has(title)) {
      positiveParagraphs.push(paragraphs.join(""));
    } else {
      negativeParagraphs.push(paragraphs.join(""));
    }
  }
  if (positiveParagraphs.length === 0 || negativeParagraphs.length === 0) {
    continue;
  }
  const candidate =
    i % 2 === 0
      ? {
          text_1: question,
          text_2: positiveParagraphs.join(""),
          label: 1,
        }
      : {
          text_1: question,
          text_2: negativeParagraphs.slice(0, 2).join(""),
          label: -1,
        };
  processed.push(candidate);
}

await Bun.write(process.argv[3], JSON.stringify(processed, null, 2));
