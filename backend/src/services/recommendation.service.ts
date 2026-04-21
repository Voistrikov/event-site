import { prisma } from '../config/prisma.js';

export class BiasedMatrixFactorization {
  private numUsers: number;
  private numItems: number;
  private numFeatures: number;
  private learningRate: number;
  private regularization: number;
  private iterations: number;
  
  private userMap: Map<string, number> = new Map();
  private itemMap: Map<string, number> = new Map();
  private reverseItemMap: Map<number, string> = new Map();
  
  private globalMean: number = 0;
  private userBiases: Float64Array;
  private itemBiases: Float64Array;
  private userFeatures: Float64Array[];
  private itemFeatures: Float64Array[];

  constructor(features = 10, lr = 0.01, reg = 0.1, iters = 100) {
    this.numFeatures = features;
    this.learningRate = lr;
    this.regularization = reg;
    this.iterations = iters;
    this.numUsers = 0;
    this.numItems = 0;
    this.userBiases = new Float64Array(0);
    this.itemBiases = new Float64Array(0);
    this.userFeatures = [];
    this.itemFeatures = [];
  }

  private initialize(ratings: {u: number, i: number, r: number}[]) {
    this.userBiases = new Float64Array(this.numUsers).fill(0);
    this.itemBiases = new Float64Array(this.numItems).fill(0);
    
    // Initialize feature matrices with random small values
    this.userFeatures = Array.from({ length: this.numUsers }, () => 
      new Float64Array(this.numFeatures).map(() => Math.random() * 0.1)
    );
    this.itemFeatures = Array.from({ length: this.numItems }, () => 
      new Float64Array(this.numFeatures).map(() => Math.random() * 0.1)
    );

    if (ratings.length > 0) {
      this.globalMean = ratings.reduce((acc, val) => acc + val.r, 0) / ratings.length;
    } else {
      this.globalMean = 0;
    }
  }

  public train(data: { userId: string, itemId: string, rating: number }[]) {
    // Map string IDs to integer indices
    for (const d of data) {
      if (!this.userMap.has(d.userId)) {
        this.userMap.set(d.userId, this.numUsers++);
      }
      if (!this.itemMap.has(d.itemId)) {
        this.itemMap.set(d.itemId, this.numItems);
        this.reverseItemMap.set(this.numItems, d.itemId);
        this.numItems++;
      }
    }

    const ratings = data.map(d => ({
      u: this.userMap.get(d.userId)!,
      i: this.itemMap.get(d.itemId)!,
      r: d.rating
    }));

    this.initialize(ratings);

    // Stochastic Gradient Descent
    for (let iter = 0; iter < this.iterations; iter++) {
      for (const {u, i, r} of ratings) {
        const prediction = this.predictInternal(u, i);
        const error = r - prediction;

        // Update biases
        this.userBiases[u] += this.learningRate * (error - this.regularization * this.userBiases[u]);
        this.itemBiases[i] += this.learningRate * (error - this.regularization * this.itemBiases[i]);

        // Update features
        for (let k = 0; k < this.numFeatures; k++) {
          const pu = this.userFeatures[u][k];
          const qi = this.itemFeatures[i][k];
          
          this.userFeatures[u][k] += this.learningRate * (error * qi - this.regularization * pu);
          this.itemFeatures[i][k] += this.learningRate * (error * pu - this.regularization * qi);
        }
      }
    }
  }

  private predictInternal(u: number, i: number): number {
    let dotProduct = 0;
    for (let k = 0; k < this.numFeatures; k++) {
      dotProduct += this.userFeatures[u][k] * this.itemFeatures[i][k];
    }
    return this.globalMean + this.userBiases[u] + this.itemBiases[i] + dotProduct;
  }

  public predict(userId: string, itemId: string): number {
    const u = this.userMap.get(userId);
    const i = this.itemMap.get(itemId);
    
    if (u === undefined || i === undefined) {
      // Fallback for cold start: return global mean + item bias (if known)
      if (i !== undefined) {
        return this.globalMean + this.itemBiases[i];
      }
      return this.globalMean;
    }
    return this.predictInternal(u, i);
  }

  public recommendForUser(userId: string, topN: number = 3): string[] {
    const u = this.userMap.get(userId);
    
    const predictions: {itemId: string, score: number}[] = [];
    
    // If cold-start user, recommend based on overall popularity (item bias)
    if (u === undefined) {
      for (let i = 0; i < this.numItems; i++) {
        predictions.push({
          itemId: this.reverseItemMap.get(i)!,
          score: this.globalMean + this.itemBiases[i]
        });
      }
    } else {
      for (let i = 0; i < this.numItems; i++) {
        predictions.push({
          itemId: this.reverseItemMap.get(i)!,
          score: this.predictInternal(u, i)
        });
      }
    }

    // Sort descending
    predictions.sort((a, b) => b.score - a.score);
    
    return predictions.slice(0, topN).map(p => p.itemId);
  }
}

// Global instance of the recommender
let recommender = new BiasedMatrixFactorization(10, 0.02, 0.1, 50);

export async function trainRecommender() {
  console.log("Training BMF algorithm...");
  
  // We use bookings as implicit ratings (5.0 for confirmed bookings)
  // For a real dataset, we'll replace this query
  const bookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED' }
  });

  const trainingData = bookings.map(b => ({
    userId: b.userId,
    itemId: b.eventId,
    rating: 5.0
  }));

  // If no bookings exist, just mock some data so the math doesn't fail
  if (trainingData.length === 0) {
    const allEvents = await prisma.event.findMany({ take: 5 });
    if (allEvents.length > 0) {
      trainingData.push({
        userId: 'mock-user-1',
        itemId: allEvents[0].id,
        rating: 5.0
      });
    }
  }

  recommender = new BiasedMatrixFactorization(10, 0.02, 0.1, 100);
  recommender.train(trainingData);
  console.log("BMF Training complete!");
}

export async function getRecommendations(userId: string | undefined): Promise<any[]> {
  // If the model has never been trained (or server restarted), train it first
  if ((recommender as any).numItems === 0) {
    await trainRecommender();
  }

  // Get top 3 recommended item IDs
  const recommendedItemIds = recommender.recommendForUser(userId || 'unknown-user', 3);

  if (recommendedItemIds.length === 0) {
    return [];
  }

  // Fetch the actual events
  const events = await prisma.event.findMany({
    where: { id: { in: recommendedItemIds } },
    include: { ticketTypes: true, photos: true }
  });

  // Sort them in the exact order recommended by BMF
  events.sort((a, b) => recommendedItemIds.indexOf(a.id) - recommendedItemIds.indexOf(b.id));

  return events;
}
