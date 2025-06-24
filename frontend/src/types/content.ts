
export interface ContentItem {
  id: string;
  type: 'note' | 'pdf' | 'url' | 'article';
  title: string;
  content: string;
  summary: string;
  tags: string[];
  category?: string;
  entities: {
    people: string[];
    topics: string[];
    dates: string[];
    locations: string[];
  };
  insights: string[];
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  connections: string[];
  isShared?: boolean;
  semanticVector?: number[];
}

export interface AIProcessingResult {
  summary: string;
  tags: string[];
  entities: {
    people: string[];
    topics: string[];
    dates: string[];
    locations: string[];
  };
  insights: string[];
  connections: string[];
  suggestedCategory?: string;
}

export interface SemanticSearchResult {
  contentId: string;
  score: number;
  title: string;
  summary: string;
}
