export type ThemeCode = {
  code: string;
  frequency: number;
  evidence: string[];
};

export type ThemeGroup = {
  name: string;
  summary: string;
  codes: string[];
};

export type AnalysisResult = {
  summary: string;
  codes: ThemeCode[];
  masterThemes: ThemeGroup[];
  superordinateThemes: ThemeGroup[];
  recommendations: string[];
};

export const emptyAnalysis: AnalysisResult = {
  summary: "",
  codes: [],
  masterThemes: [],
  superordinateThemes: [],
  recommendations: [],
};
