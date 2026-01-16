/**
 * Naver Blog Crawler
 * 네이버 블로그 검색 API를 사용하여 블로그 게시글을 검색하고 크롤링
 */

import {
  NaverBlogSearchResult,
  NaverBlogSearchResponse,
  BlogContent,
} from '@/types/blog.types';
import { RateLimiter } from '@/utils/rate-limiter';
import * as cheerio from 'cheerio';

const rateLimiter = new RateLimiter(10); // 10 req/sec

/**
 * 네이버 블로그 검색
 * @param query 검색 쿼리
 * @param display 가져올 결과 개수 (최대 100)
 * @returns 블로그 검색 결과 배열
 */
export async function searchNaverBlogs(
  query: string,
  display: number = 10
): Promise<NaverBlogSearchResult[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('Naver API credentials not set, skipping blog search');
    return [];
  }

  await rateLimiter.throttle();

  const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(
    query
  )}&display=${display}&sort=sim`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      console.error(`Naver Blog API error: ${response.status}`);
      return [];
    }

    const data: NaverBlogSearchResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to search Naver blogs:', error);
    return [];
  }
}

/**
 * 블로그 검색 결과를 날짜 범위로 필터링
 * 네이버 API는 날짜 필터를 지원하지 않으므로 클라이언트에서 필터링
 *
 * @param blogs 네이버 블로그 검색 결과
 * @param startDate 시작 날짜 (이 날짜 이후 게시물만)
 * @param endDate 종료 날짜 (이 날짜 이전 게시물만)
 * @returns 날짜 범위 내의 블로그 결과
 */
export function filterBlogsByDateRange(
  blogs: NaverBlogSearchResult[],
  startDate: Date,
  endDate: Date
): NaverBlogSearchResult[] {
  return blogs.filter((blog) => {
    // postdate는 YYYYMMDD 형식 (예: "20260115")
    const postdate = blog.postdate;
    if (!postdate || postdate.length !== 8) {
      console.warn(`Invalid postdate format: ${postdate} for blog: ${blog.title}`);
      return false; // 잘못된 날짜 형식은 제외
    }

    try {
      // YYYYMMDD → Date 객체로 변환
      const year = parseInt(postdate.substring(0, 4), 10);
      const month = parseInt(postdate.substring(4, 6), 10) - 1; // 0-indexed
      const day = parseInt(postdate.substring(6, 8), 10);
      const blogDate = new Date(year, month, day);

      // 날짜 비교를 위해 시간 부분 제거
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));

      // 날짜 범위 체크
      return blogDate >= start && blogDate <= end;
    } catch (error) {
      console.error(`Failed to parse postdate: ${postdate}`, error);
      return false;
    }
  });
}

/**
 * 블로그 게시글 내용 크롤링
 * @param url 블로그 게시글 URL
 * @returns 크롤링된 블로그 콘텐츠
 */
export async function crawlBlogContent(
  url: string
): Promise<BlogContent | null> {
  try {
    await rateLimiter.throttle();

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch blog ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unnecessary elements
    $('script, style, nav, footer, iframe, img').remove();

    // Extract title
    const title =
      $('title').text() ||
      $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    // Extract main content
    // Naver blog specific selectors + generic fallbacks
    let content =
      $('.se-main-container').text() || // Naver SmartEditor
      $('#postViewArea').text() || // Old Naver blog
      $('article').text() || // Generic article tag
      $('.post-content').text() || // Generic post content
      $('body').text(); // Fallback to body

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Limit content length to control API costs
    const maxLength = 5000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength);
    }

    return {
      url,
      title: title.trim(),
      content,
      crawledAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to crawl blog ${url}:`, error);
    return null;
  }
}

/**
 * 여러 블로그 게시글을 병렬로 크롤링
 * @param urls 크롤링할 URL 배열
 * @param maxConcurrent 최대 동시 크롤링 수
 * @returns 크롤링된 블로그 콘텐츠 배열
 */
export async function crawlMultipleBlogs(
  urls: string[],
  maxConcurrent: number = 3
): Promise<BlogContent[]> {
  const results: BlogContent[] = [];

  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map((url) => crawlBlogContent(url))
    );

    // Filter out null results
    const validResults = batchResults.filter(
      (result): result is BlogContent => result !== null
    );
    results.push(...validResults);
  }

  return results;
}
