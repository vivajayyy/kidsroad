/**
 * Naver Blog Search API 타입 정의
 */

export interface NaverBlogSearchResult {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string; // YYYYMMDD
}

export interface NaverBlogSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBlogSearchResult[];
}

export interface BlogContent {
  url: string;
  title: string;
  content: string; // Cleaned HTML → plain text
  crawledAt: string;
}
