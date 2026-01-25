export const ANALYZE_TYPE = {
  WEB: 1,
  JSON: 2,
} as const;
export type IAnalyzeType = (typeof ANALYZE_TYPE)[keyof typeof ANALYZE_TYPE];
export const analyzeTypes = Object.values(ANALYZE_TYPE);
