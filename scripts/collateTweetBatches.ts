import fs from 'fs/promises';
import clipboardy from 'clipboardy';
import { readJSON, writeJSON } from './utils.js';
import { RealTweet, Tweet } from './types.js';

// read all json files from batches dir
const DIR_PATH = './batches';
const files = await fs.readdir(DIR_PATH);
const batches = [];
for (const file of files) {
  batches.push(fs.readFile(`${DIR_PATH}/${file}`, 'utf-8'));
}
const fileContents = await Promise.all(batches);

// parse the json
const tweets: RealTweet[] = [];
for (const fileContent of fileContents) {
  tweets.push(...JSON.parse(fileContent));
}

// filter the tweets to only get highly rated candidates
// remove tweets that would make poor candidates due to certain features that were missed before batches were made
let bestCandidateTweets = tweets
  .filter(
    (t) =>
      t.rating >= 9 &&
      !t.text.includes('http') &&
      !t.text.startsWith('.') &&
      !t.text.match(/(\.+){2,}$/),
  )
  .map((t) => ({ ...t, text: t.text.replaceAll('""', '"') }));
const tweetSet = new Set();
const bestCandidateTweetsWithDuplicatesRemoved = [];
for (const t of bestCandidateTweets) {
  if (!tweetSet.has(t.text)) {
    tweetSet.add(t.text);
    bestCandidateTweetsWithDuplicatesRemoved.push(t);
  }
}

// write these final tweets to the fs
await Promise.all([
  writeJSON('./all-real-tweets.json', bestCandidateTweetsWithDuplicatesRemoved),
  writeJSON(
    '../frontend/src/data/all-real-tweets.json',
    bestCandidateTweetsWithDuplicatesRemoved,
  ),
]);
