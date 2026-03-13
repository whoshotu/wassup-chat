import decoder from './src/lib/decoder.js';

async function test() {
  const result = await decoder.decodeMessage("C'est la vie, mon ami! <3", "English");
  console.log("Input: C'est la vie, mon ami! <3");
  console.log("Source Lang:", result.sourceLanguage);
  console.log("Translation:", result.translatedText);
  console.log("Tones:", result.toneTags);
}

test();
