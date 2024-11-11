import fs from 'fs/promises';
import clipboardy from 'clipboardy';

const DIR_PATH = './batches';
const files = await fs.readdir(DIR_PATH);
const batches = [];
for (const file of files) {
  batches.push(fs.readFile(`${DIR_PATH}/${file}`, 'utf-8'));
}
const fileContents = await Promise.all(batches);

const tweets = [];
for (const fileContent of fileContents) {
  tweets.push(...JSON.parse(fileContent));
}

let highlyRatedTweets = tweets
  .filter((t) => t.rating >= 9)
  .map((t) => t.text);

highlyRatedTweets = [...new Set(highlyRatedTweets)];

await fs.writeFile(
  './highly-rated-tweets.json',
  JSON.stringify(highlyRatedTweets),
);

//await clipboardy.writeSync(
//   highlyRatedTweets.map((t, i) => `${i}. ${t}`).join('\n'),
// );
