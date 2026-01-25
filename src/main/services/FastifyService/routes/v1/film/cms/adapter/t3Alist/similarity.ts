export interface IRating {
  target: string;
  rating: number;
}

export interface ILCSResult {
  length: number;
  sequence: string;
  offset: number;
}

export interface ILCSMatch {
  target: string;
  lcs: ILCSResult;
}

const compareTwoStrings = (first: string, second: string): number => {
  // Normalize the strings by removing spaces
  const cleanedFirst = first.replace(/\s+/g, '');
  const cleanedSecond = second.replace(/\s+/g, '');

  // If they are the same after cleaning, return 1
  if (cleanedFirst === cleanedSecond) return 1;

  // If either string is too short, return 0 (no match)
  if (cleanedFirst.length < 2 || cleanedSecond.length < 2) return 0;

  // Create bigrams for the first string
  const firstBigrams = new Map<string, number>();
  for (let i = 0; i < cleanedFirst.length - 1; i++) {
    const bigram = cleanedFirst.substring(i, i + 2);
    firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
  }

  // Find the intersection of bigrams between the two strings
  let intersectionSize = 0;
  for (let i = 0; i < cleanedSecond.length - 1; i++) {
    const bigram = cleanedSecond.substring(i, i + 2);
    const count = firstBigrams.get(bigram) || 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1); // Decrement to avoid duplicate matches
      intersectionSize++;
    }
  }

  // Return the Jaccard similarity coefficient for the bigrams
  return (2 * intersectionSize) / (cleanedFirst.length + cleanedSecond.length - 2);
};

export const findBestMatch = (
  mainString: string,
  targetStrings: string[],
): { ratings: IRating[]; bestMatch: IRating; bestMatchIndex: number } => {
  const ratings: IRating[] = [];
  let bestMatchIndex: number = 0;

  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i];
    const currentRating = compareTwoStrings(mainString, currentTargetString);
    ratings.push({ target: currentTargetString, rating: currentRating });

    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i;
    }
  }

  return { ratings, bestMatch: ratings[bestMatchIndex], bestMatchIndex };
};

export const lcs = (str1: string, str2: string): ILCSResult => {
  if (!str1 || !str2) return { length: 0, sequence: '', offset: 0 };

  const str1Length = str1.length;
  const str2Length = str2.length;
  const dp = Array.from({ length: str1Length }, () => {
    return Array.from({ length: str2Length }).fill(0);
  }) as number[][];

  let maxLen = 0;
  let endIndex = 0;

  for (let i = 0; i < str1Length; i++) {
    for (let j = 0; j < str2Length; j++) {
      if (str1[i] === str2[j]) {
        dp[i][j] = i === 0 || j === 0 ? 1 : dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLen) {
          maxLen = dp[i][j];
          endIndex = i;
        }
      } else {
        dp[i][j] = 0;
      }
    }
  }

  const sequence = str1.slice(endIndex - maxLen + 1, endIndex + 1);
  const offset = endIndex - maxLen + 1;

  return { length: maxLen, sequence, offset };
};

export const findBestLCS = (
  mainString: string,
  targetStrings: string[],
): { allLCS: ILCSMatch[]; bestMatch: ILCSMatch; bestMatchIndex: number } => {
  const results: ILCSMatch[] = [];
  let bestMatchIndex = 0;

  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i];
    const currentLCS = lcs(mainString, currentTargetString);
    results.push({ target: currentTargetString, lcs: currentLCS });

    if (currentLCS.length > results[bestMatchIndex].lcs.length) {
      bestMatchIndex = i;
    }
  }

  return { allLCS: results, bestMatch: results[bestMatchIndex], bestMatchIndex };
};
