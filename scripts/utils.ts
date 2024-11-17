import fs from 'fs/promises';
import { RealTweet, Tweet } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function zip(...arrays) {
  const minLength = Math.min(...arrays.map((arr) => arr.length));
  return Array.from({ length: minLength }, (_, i) =>
    arrays.map((arr) => arr[i]),
  );
}

export async function readJSON(path: string) {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}

export async function writeJSON(path: string, data) {
  await fs.writeFile(path, JSON.stringify(data));
}

export function getUpperCaseWordsMessage(text: string) {
  const uppercaseWords = text.match(/\b([A-Z]{2,})\b/g);
  const totalUppercaseWords = uppercaseWords ? uppercaseWords.length : 0;
  const words = text.match(/\b([a-zA-Z]+)\b/g);
  const totalWords = words ? words.length : 0;
  const isAllUppercaseWords = totalUppercaseWords / totalWords === 1;
  return isAllUppercaseWords ? 'all' : totalUppercaseWords;
}

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }
  return array;
}

export function estimateTokens(str: string) {
  return str.length / 4;
}

// get the tweets that are easiest to generate for ai
export async function getFilteredTweets() {
  const tweets = (await readJSON('./tweets.json')) as Tweet[];

  let filteredTweets: Pick<Tweet, 'id' | 'text'>[] = tweets
    .filter(
      (tweet) =>
        tweet.isRetweet === 'f' &&
        !tweet.text.includes('https') &&
        !tweet.text.includes('http') &&
        !tweet.text.includes('@'),
    )
    .sort((a, b) => b.favorites - a.favorites)
    .map((tweet) => ({ id: tweet.id, text: tweet.text }));
  const tweetsWithIndex = filteredTweets.map(
    (tweet, i) => `${i}. ${tweet.text}`,
  );

  return { filteredTweets, tweetsWithIndex };
}

export async function postProcessFakeTweets() {
  let [real, fake]: [RealTweet[], string[]] = await Promise.all([
    readJSON('./real-tweets.json'),
    readJSON('./fake-tweets.json'),
  ]);

  // add a unique id, the id of the real tweet that the fake tweet is based from
  const newFakeStructure = new Array(fake.length);
  for (let i = 0; i < Math.min(real.length, fake.length); i++) {
    newFakeStructure[i] = {
      id: uuidv4(),
      correspondingRealTweetId: real[i].id,
      text: fake[i],
    };
  }

  await Promise.all([
    writeJSON('./fake-tweets.json', newFakeStructure),
    writeJSON('../frontend/src/data/fake-tweets.json', newFakeStructure),
  ]);
}
