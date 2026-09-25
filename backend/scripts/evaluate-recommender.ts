import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import {
  BiasedMatrixFactorization,
  type Rating,
} from '../src/services/biased-matrix-factorization.js';

const defaultDataset = path.resolve('dataset/rel_event_csvs/event_interest.csv');
const datasetPath = path.resolve(process.argv[2] ?? defaultDataset);

function implicitRating(interested: string, notInterested: string): number {
  if (interested === '1') return 5;
  if (notInterested === '1') return 1;
  return 2;
}

async function loadRatings(filePath: string): Promise<{ ratings: Rating[]; skipped: number }> {
  await access(filePath);
  const lines = readline.createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });
  const ratingsByPair = new Map<string, Rating>();
  let firstLine = true;
  let skipped = 0;

  for await (const line of lines) {
    if (firstLine) {
      firstLine = false;
      if (line.trim() !== 'user,event,invited,timestamp,interested,not_interested') {
        throw new Error(`Unexpected event_interest.csv header: ${line}`);
      }
      continue;
    }
    if (!line.trim()) continue;
    const [userId, itemId, , , interested, notInterested] = line.split(',');
    if (interested === undefined || notInterested === undefined) {
      throw new Error(`Malformed dataset row: ${line}`);
    }
    // The supplied export contains rows whose anonymized event identifier was
    // removed. They cannot form a user-item interaction and are ignored.
    if (!userId || !itemId) {
      skipped++;
      continue;
    }
    ratingsByPair.set(`${userId}:${itemId}`, {
      userId,
      itemId,
      rating: implicitRating(interested, notInterested),
    });
  }
  return { ratings: Array.from(ratingsByPair.values()), skipped };
}

function splitByUser(ratings: Rating[]): { training: Rating[]; test: Rating[] } {
  const byUser = new Map<string, Rating[]>();
  for (const rating of ratings) {
    const userRatings = byUser.get(rating.userId) ?? [];
    userRatings.push(rating);
    byUser.set(rating.userId, userRatings);
  }

  const training: Rating[] = [];
  const test: Rating[] = [];
  for (const userRatings of byUser.values()) {
    if (userRatings.length < 2) {
      training.push(...userRatings);
      continue;
    }
    // A deterministic leave-one-out split ensures every evaluated user is
    // known to the model and makes repeated runs directly comparable.
    test.push(userRatings[userRatings.length - 1]!);
    training.push(...userRatings.slice(0, -1));
  }
  return { training, test };
}

function metricSummary(model: BiasedMatrixFactorization, test: Rating[], baseline: number) {
  let squaredError = 0;
  let absoluteError = 0;
  let baselineSquaredError = 0;
  for (const rating of test) {
    const prediction = Math.min(5, Math.max(1, model.predict(rating.userId, rating.itemId)));
    const error = rating.rating - prediction;
    squaredError += error ** 2;
    absoluteError += Math.abs(error);
    baselineSquaredError += (rating.rating - baseline) ** 2;
  }
  return {
    rmse: Math.sqrt(squaredError / test.length),
    mae: absoluteError / test.length,
    baselineRmse: Math.sqrt(baselineSquaredError / test.length),
  };
}

async function main(): Promise<void> {
  const { ratings, skipped } = await loadRatings(datasetPath);
  const { training, test } = splitByUser(ratings);
  if (training.length === 0 || test.length === 0) throw new Error('Dataset is too small to evaluate.');

  const model = new BiasedMatrixFactorization(10, 0.02, 0.1, 100, 42);
  model.train(training);
  const mean = training.reduce((sum, rating) => sum + rating.rating, 0) / training.length;
  const metrics = metricSummary(model, test, mean);
  const users = new Set(ratings.map(({ userId }) => userId)).size;
  const events = new Set(ratings.map(({ itemId }) => itemId)).size;
  const labels = ratings.reduce((counts, { rating }) => {
    if (rating === 5) counts.interested++;
    else if (rating === 1) counts.notInterested++;
    else counts.viewed++;
    return counts;
  }, { interested: 0, notInterested: 0, viewed: 0 });

  console.log(`Dataset: ${datasetPath}`);
  console.log(`Interactions: ${ratings.length} (${users} users, ${events} events)`);
  console.log(`Skipped rows without user/event identifiers: ${skipped}`);
  console.log(`Signals: ${labels.interested} interested, ${labels.notInterested} not interested, ${labels.viewed} viewed/neutral`);
  console.log(`Split: ${training.length} training, ${test.length} test`);
  console.log(`BMF RMSE: ${metrics.rmse.toFixed(4)}`);
  console.log(`BMF MAE: ${metrics.mae.toFixed(4)}`);
  console.log(`Global-mean baseline RMSE: ${metrics.baselineRmse.toFixed(4)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
