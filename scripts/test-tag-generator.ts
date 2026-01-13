/**
 * Test script for tag generator
 * 태그 생성 로직을 테스트하는 스크립트
 */

import { generateTags } from "../lib/tag-generator";

async function testTagGenerator() {
  console.log("=== Tag Generator Test ===\n");

  const testCases = [
    {
      category: "축제/행사",
      title: "서울어린이대공원 벚꽃축제",
      description: "봄에 즐기는 가족 나들이, 무료 입장",
      age_ranges: ["0-2", "3-5", "6-9", "10+"],
    },
    {
      category: "문화시설",
      title: "국립중앙박물관 어린이체험전시",
      description: "초등학생을 위한 역사 체험 프로그램, 실내 전시",
      age_ranges: ["6-9", "10+"],
    },
    {
      category: "관광지",
      title: "롯데월드 어드벤처",
      description: "어린이 놀이기구와 공연이 있는 실내외 테마파크",
      age_ranges: ["3-5", "6-9", "10+"],
    },
    {
      category: "축제/행사",
      title: "크리스마스 겨울 축제",
      description: "야간 빛축제와 눈썰매장, 주말 가족 이벤트",
      age_ranges: ["0-2", "3-5", "6-9"],
    },
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\nTest Case ${index + 1}:`);
    console.log(`카테고리: ${testCase.category}`);
    console.log(`제목: ${testCase.title}`);
    console.log(`설명: ${testCase.description}`);
    console.log(`연령대: ${testCase.age_ranges.join(", ")}`);

    const tags = generateTags(
      testCase.category,
      testCase.title,
      testCase.description,
      testCase.age_ranges
    );

    console.log(`✅ 생성된 태그 (${tags.length}개):`, tags);
  });

  console.log("\n=== Test Complete ===");
}

testTagGenerator().catch(console.error);
