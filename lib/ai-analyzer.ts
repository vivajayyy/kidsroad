/**
 * AI Analyzer using Claude Haiku
 * 블로그 콘텐츠에서 부모 체크리스트 정보를 AI로 추출
 */

import Anthropic from "@anthropic-ai/sdk";
import { EnrichmentResult } from "@/types/enrichment.types";
import { BlogContent } from "@/types/blog.types";
import { RateLimiter } from "@/utils/rate-limiter";

const rateLimiter = new RateLimiter(50 / 60); // 50 req/min

/**
 * 블로그 콘텐츠를 AI로 분석하여 부모 체크리스트 정보 추출
 * @param eventTitle 이벤트 제목
 * @param blogContents 분석할 블로그 콘텐츠 배열
 * @returns 추출된 체크리스트 정보
 */
export async function analyzeBlogs(
  eventTitle: string,
  blogContents: BlogContent[]
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("Anthropic API key not set, skipping AI analysis");
    return null;
  }

  if (blogContents.length === 0) {
    console.warn("No blog contents to analyze");
    return null;
  }

  await rateLimiter.throttle();

  const client = new Anthropic({ apiKey });

  // Combine blog contents with length limits
  const combinedContent = blogContents
    .map(
      (blog, i) => `
=== 블로그 ${i + 1} ===
제목: ${blog.title}
내용: ${blog.content.substring(0, 1500)}
`
    )
    .join("\n");

  const prompt = `
당신은 부모들을 위한 이벤트 정보 분석 전문가입니다.
아래 블로그 리뷰들을 분석하여 "${eventTitle}" 이벤트에 대한 부모 체크리스트 정보를 추출하세요.

${combinedContent}

다음 정보를 추출하여 **반드시 유효한 JSON 형식으로만** 응답하세요:

{
  "is_kid_friendly": true/false/null,
  "has_parking": true/false/null,
  "has_stroller_access": true/false/null,
  "has_nursing_room": true/false/null,
  "has_diaper_station": true/false/null,
  "age_ranges": ["0-2", "3-5", "6-9", "10+"],
  "is_indoor": true/false/null,
  "is_outdoor": true/false/null,
  "confidence_score": 0.0
}

**규칙:**
- is_kid_friendly: **[최우선 판단]** 이 행사가 아이와 함께 참여하기에 적합한지 판단
  - true: 아이 동반 가능, 가족 친화적 내용, 어린이 대상 프로그램
  - false: 성인 전용, 신체적으로 어린이에게 부적합, 위험한 활동
  - null: 판단 불가 (정보 부족)
  - **중요**: 마라톤, 철인3종, 등산, 트레킹 등 신체적 요구사항이 높은 활동은 반드시 false
  - **중요**: 와인, 맥주, 주류 관련 행사는 반드시 false
  - **중요**: 성인 전용, 19금 콘텐츠는 반드시 false
- has_parking: 주차 가능 여부. 주차장 언급이 있으면 true, 주차 어려움 언급이 있으면 false, 언급 없으면 null
- has_stroller_access: **유모차 대여 가능 여부** (최우선). "유모차 대여", "유모차 렌탈" 언급이 있으면 true. 대여 언급이 없어도 "유모차 OK", "유모차 사용 가능", "베리어프리" 등 긍정적 접근성 언급이 있으면 true. "유모차 불편", "계단 많음", "경사 심함" 등이 있으면 false
- has_nursing_room: 수유실 유무. 명시적으로 언급된 경우만 true
- has_diaper_station: 기저귀 교환대. 명시적으로 언급된 경우만 true
- age_ranges: 적합한 연령대 배열 (복수 선택 가능). 블로그에서 언급된 어린이 나이나 "아기", "유아", "초등학생" 등을 기반으로 판단. is_kid_friendly가 false면 빈 배열 [] 반환
- is_indoor: 실내 시설이면 true, 야외면 false, 혼합이거나 불명확하면 null
- is_outdoor: 야외 시설이면 true, 실내면 false, 혼합이거나 불명확하면 null
- confidence_score: 분석 신뢰도 (0.0-1.0). 블로그가 많고 정보가 일치할수록 높게, 정보가 부족하거나 상충되면 낮게

**중요:**
- 언급되지 않은 항목은 반드시 null로 설정
- 추측하지 말고 블로그에 명시된 내용만 기반으로 판단
- JSON 외 다른 텍스트를 포함하지 마세요
`.trim();

  try {
    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      console.error("No text content in AI response");
      return null;
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const result = JSON.parse(jsonText);

    // Calculate estimated token usage for logging
    const estimatedTokens = Math.ceil((prompt.length + jsonText.length) / 4);
    console.log(
      `[AI Analysis] Event: "${eventTitle}", Blogs: ${blogContents.length}, Est. tokens: ${estimatedTokens}`
    );

    return {
      ...result,
      source_blog_count: blogContents.length,
      analyzed_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return null;
  }
}

/**
 * AI 분석 결과의 신뢰도가 충분한지 확인
 * @param result AI 분석 결과
 * @param minConfidence 최소 신뢰도 (기본값: 0.5)
 * @returns 신뢰도가 충분하면 true
 */
export function isConfidentResult(
  result: EnrichmentResult,
  minConfidence: number = 0.5
): boolean {
  return result.confidence_score >= minConfidence;
}
