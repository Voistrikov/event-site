export interface Rating {
  userId: string;
  itemId: string;
  rating: number;
}

interface IndexedRating { u: number; i: number; r: number }

interface Snapshot {
  userBiases: Float64Array<ArrayBufferLike>;
  itemBiases: Float64Array<ArrayBufferLike>;
  userFeatures: Float64Array<ArrayBufferLike>[];
  itemFeatures: Float64Array<ArrayBufferLike>[];
}

/** Biased Matrix Factorization trained from scratch with SGD. */
export class BiasedMatrixFactorization {
  // Below this many held-out points, validation RMSE is too noisy a signal
  // to decide when to stop on (see the check in train()).
  private static readonly minValidationSize = 20;

  private numUsers = 0;
  private numItems = 0;
  private readonly userMap = new Map<string, number>();
  private readonly itemMap = new Map<string, number>();
  private readonly reverseItemMap = new Map<number, string>();
  private globalMean = 0;
  private userBiases: Float64Array<ArrayBufferLike> = new Float64Array(0);
  private itemBiases: Float64Array<ArrayBufferLike> = new Float64Array(0);
  private userFeatures: Float64Array<ArrayBufferLike>[] = [];
  private itemFeatures: Float64Array<ArrayBufferLike>[] = [];

  constructor(
    private readonly numFeatures = 10,
    private readonly learningRate = 0.01,
    private readonly regularization = 0.1,
    private readonly maxIterations = 100,
    private readonly randomSeed = 42,
    // On this assignment's data (a handful of ratings per user) the model
    // starts overfitting well before 100 epochs: held-out error improves for
    // a few epochs then gets steadily worse as biases and factors memorise
    // individual ratings. Training stops once a small validation slice (cut
    // from the training data itself, never from the caller's own held-out
    // test set) stops improving for `earlyStoppingPatience` epochs in a row,
    // and the best-seen weights are restored.
    private readonly earlyStoppingPatience = 5,
  ) {}

  private initialize(ratings: IndexedRating[]): void {
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

  /**
   * Holds out one rating per user that has at least three, mirroring the
   * leave-one-out shape used for the assignment dataset's own test split.
   * Users with fewer ratings stay entirely in training so sparse users are
   * never dropped from the model.
   */
  private splitValidation(ratings: IndexedRating[]): { train: IndexedRating[]; val: IndexedRating[] } {
    const byUser = new Map<number, IndexedRating[]>();
    for (const rating of ratings) {
      const userRatings = byUser.get(rating.u) ?? [];
      userRatings.push(rating);
      byUser.set(rating.u, userRatings);
    }
    const train: IndexedRating[] = [];
    const val: IndexedRating[] = [];
    for (const userRatings of byUser.values()) {
      if (userRatings.length < 3) {
        train.push(...userRatings);
        continue;
      }
      val.push(userRatings[userRatings.length - 1]!);
      train.push(...userRatings.slice(0, -1));
    }
    return { train, val };
  }

  private runEpoch(ratings: IndexedRating[]): void {
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

  private rmse(ratings: IndexedRating[]): number {
    if (ratings.length === 0) return Infinity;
    let squaredError = 0;
    for (const { u, i, r } of ratings) {
      squaredError += (r - this.predictInternal(u, i)) ** 2;
    }
    return Math.sqrt(squaredError / ratings.length);
  }

  private snapshot(): Snapshot {
    return {
      userBiases: Float64Array.from(this.userBiases),
      itemBiases: Float64Array.from(this.itemBiases),
      userFeatures: this.userFeatures.map((vector) => Float64Array.from(vector)),
      itemFeatures: this.itemFeatures.map((vector) => Float64Array.from(vector)),
    };
  }

  private restore(snapshot: Snapshot): void {
    this.userBiases = snapshot.userBiases;
    this.itemBiases = snapshot.itemBiases;
    this.userFeatures = snapshot.userFeatures;
    this.itemFeatures = snapshot.itemFeatures;
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

    const { train, val } = this.splitValidation(ratings);
    if (val.length < BiasedMatrixFactorization.minValidationSize) {
      // A handful of held-out points (typical for a live app with a few
      // dozen users) makes the validation RMSE noisy enough that "no
      // improvement this epoch" is often just chance, stopping training
      // near its random initialization. Below this size the signal isn't
      // trustworthy, so fall back to a fixed number of epochs on all the
      // data instead of trying to early-stop on it.
      for (let iteration = 0; iteration < this.maxIterations; iteration++) this.runEpoch(ratings);
      return;
    }

    let bestRmse = Infinity;
    let bestSnapshot = this.snapshot();
    let epochsWithoutImprovement = 0;
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      this.runEpoch(train);
      const validationRmse = this.rmse(val);
      if (validationRmse < bestRmse - 1e-6) {
        bestRmse = validationRmse;
        bestSnapshot = this.snapshot();
        epochsWithoutImprovement = 0;
      } else {
        epochsWithoutImprovement++;
        if (epochsWithoutImprovement >= this.earlyStoppingPatience) break;
      }
    }
    this.restore(bestSnapshot);
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
