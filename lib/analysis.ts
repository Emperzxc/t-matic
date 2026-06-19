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

export type AnalysisHistoryItem = {
  id: string;
  created_at: string;
  summary: string;
  total_codes: number;
  master_theme_count: number;
  superordinate_theme_count: number;
};

export const emptyAnalysis: AnalysisResult = {
  summary: "",
  codes: [],
  masterThemes: [],
  superordinateThemes: [],
  recommendations: [],
};
