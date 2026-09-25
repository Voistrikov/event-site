export interface Rating {
  userId: string;
  itemId: string;
  rating: number;
}

/** Biased Matrix Factorization trained from scratch with SGD. */
export class BiasedMatrixFactorization {
  private numUsers = 0;
  private numItems = 0;
  private readonly userMap = new Map<string, number>();
  private readonly itemMap = new Map<string, number>();
  private readonly reverseItemMap = new Map<number, string>();
  private globalMean = 0;
  private userBiases = new Float64Array(0);
  private itemBiases = new Float64Array(0);
  private userFeatures: Float64Array[] = [];
  private itemFeatures: Float64Array[] = [];

  constructor(
    private readonly numFeatures = 10,
    private readonly learningRate = 0.01,
    private readonly regularization = 0.1,
    private readonly iterations = 100,
    private readonly randomSeed = 42,
  ) {}

  private initialize(ratings: { u: number; i: number; r: number }[]): void {
    this.userBiases = new Float64Array(this.numUsers);
    this.itemBiases = new Float64Array(this.numItems);

    // A seeded generator makes recommendations and dataset evaluation
    // reproducible while retaining the usual small random initialization.
    let state = this.randomSeed >>> 0;
    const random = () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 0x100000000;
    };
    this.userFeatures = Array.from(
      { length: this.numUsers },
      () => Float64Array.from({ length: this.numFeatures }, () => random() * 0.1),
    );
    this.itemFeatures = Array.from(
      { length: this.numItems },
      () => Float64Array.from({ length: this.numFeatures }, () => random() * 0.1),
    );
    this.globalMean = ratings.length === 0
      ? 0
      : ratings.reduce((sum, value) => sum + value.r, 0) / ratings.length;
  }

  public train(data: Rating[]): void {
    this.numUsers = 0;
    this.numItems = 0;
    this.userMap.clear();
    this.itemMap.clear();
    this.reverseItemMap.clear();

    for (const value of data) {
      if (!this.userMap.has(value.userId)) this.userMap.set(value.userId, this.numUsers++);
      if (!this.itemMap.has(value.itemId)) {
        this.itemMap.set(value.itemId, this.numItems);
        this.reverseItemMap.set(this.numItems, value.itemId);
        this.numItems++;
      }
    }

    const ratings = data.map((value) => ({
      u: this.userMap.get(value.userId)!,
      i: this.itemMap.get(value.itemId)!,
      r: value.rating,
    }));
    this.initialize(ratings);

    for (let iteration = 0; iteration < this.iterations; iteration++) {
      for (const { u, i, r } of ratings) {
        const error = r - this.predictInternal(u, i);
        const userVector = this.userFeatures[u]!;
        const itemVector = this.itemFeatures[i]!;

        this.userBiases[u] = this.userBiases[u]!
          + this.learningRate * (error - this.regularization * this.userBiases[u]!);
        this.itemBiases[i] = this.itemBiases[i]!
          + this.learningRate * (error - this.regularization * this.itemBiases[i]!);

        for (let feature = 0; feature < this.numFeatures; feature++) {
          const userValue = userVector[feature]!;
          const itemValue = itemVector[feature]!;
          userVector[feature] = userValue + this.learningRate
            * (error * itemValue - this.regularization * userValue);
          itemVector[feature] = itemValue + this.learningRate
            * (error * userValue - this.regularization * itemValue);
        }
      }
    }
  }

  private predictInternal(user: number, item: number): number {
    const userVector = this.userFeatures[user]!;
    const itemVector = this.itemFeatures[item]!;
    let dotProduct = 0;
    for (let feature = 0; feature < this.numFeatures; feature++) {
      dotProduct += userVector[feature]! * itemVector[feature]!;
    }
    return this.globalMean + this.userBiases[user]! + this.itemBiases[item]! + dotProduct;
  }

  public predict(userId: string, itemId: string): number {
    const user = this.userMap.get(userId);
    const item = this.itemMap.get(itemId);
    if (user === undefined || item === undefined) {
      return this.globalMean
        + (user === undefined ? 0 : this.userBiases[user]!)
        + (item === undefined ? 0 : this.itemBiases[item]!);
    }
    return this.predictInternal(user, item);
  }

  public recommendForUser(userId: string, topN = 3, candidateItemIds?: string[]): string[] {
    const itemIds = candidateItemIds ?? Array.from(this.reverseItemMap.values());
    return itemIds
      .map((itemId) => ({ itemId, score: this.predict(userId, itemId) }))
      .sort((a, b) => b.score - a.score || a.itemId.localeCompare(b.itemId))
      .slice(0, topN)
      .map(({ itemId }) => itemId);
  }
}
