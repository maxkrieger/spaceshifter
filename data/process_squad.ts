const trainFile = Bun.file(process.argv[2], {
  type: "application/json;charset=utf-8",
});

const trainJson = await trainFile.json();

const processed = trainJson.data
  .flatMap(({ paragraphs }) =>
    paragraphs
      .flatMap(({ context, qas }) => {
        const possibles = qas.filter(({ is_impossible }) => !is_impossible);
        if (possibles.length === 0) {
          return null;
        }
        return {
          text_1: context,
          text_2: possibles[0].question,
          label: 1,
        };
      })
      .filter((a) => a !== null)
  )
  .slice(0, 2000);

await Bun.write(process.argv[3], JSON.stringify(processed, null, 2));
