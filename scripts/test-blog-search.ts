/**
 * Test script for blog search
 * 네이버 블로그 검색 API를 테스트하는 스크립트
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { searchNaverBlogs, crawlBlogContent } from "../lib/blog-crawler";

async function testBlogSearch() {
  console.log("=== Naver Blog Search Test ===\n");

  // Check environment variables
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.error(
      "❌ NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set in .env.local"
    );
    return;
  }

  console.log("✅ Naver API credentials found\n");

  // Test query
  const query = "서울어린이대공원 후기 유모차 주차";
  console.log(`Searching for: "${query}"\n`);

  try {
    const results = await searchNaverBlogs(query, 5);

    if (results.length === 0) {
      console.log("❌ No blog results found");
      return;
    }

    console.log(`✅ Found ${results.length} blog posts:\n`);

    results.forEach((result, index) => {
      console.log(`\n--- Blog ${index + 1} ---`);
      console.log(`제목: ${result.title.replace(/<[^>]*>/g, "")}`); // Remove HTML tags
      console.log(`블로거: ${result.bloggername}`);
      console.log(`날짜: ${result.postdate}`);
      console.log(`URL: ${result.link}`);
      console.log(
        `설명: ${result.description.replace(/<[^>]*>/g, "").substring(0, 100)}...`
      );
    });

    // Test crawling the first blog
    if (results.length > 0) {
      console.log("\n\n=== Testing Blog Crawling ===\n");
      console.log(`Crawling first blog: ${results[0].link}`);

      const content = await crawlBlogContent(results[0].link);

      if (content) {
        console.log("\n✅ Successfully crawled blog:");
        console.log(`제목: ${content.title}`);
        console.log(`내용 길이: ${content.content.length} characters`);
        console.log(`크롤링 시간: ${content.crawledAt}`);
        console.log(`내용 미리보기:\n${content.content.substring(0, 300)}...`);
      } else {
        console.log("❌ Failed to crawl blog content");
      }
    }

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testBlogSearch().catch(console.error);
