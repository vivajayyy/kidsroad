import {
  TourApiResponse,
  FestivalItem,
  DetailCommonItem,
  FestivalIntroItem,
  CultureIntroItem,
  TourImageItem,
} from "../types/tour-api";

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const MOBILE_OS = "ETC"; // IOS, AND, WIN, ETC
const MOBILE_APP = "Kidsroad"; // Service name - PascalCase as per user's working example

interface CommonQueryParams {
  _type: "json";
  MobileOS: typeof MOBILE_OS;
  MobileApp: typeof MOBILE_APP;
  serviceKey: string;
}

// Helper to build URL and fetch data
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, any>
): Promise<T[]> {
  const serviceKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;

  if (!serviceKey) {
    console.error("NEXT_PUBLIC_TOUR_API_KEY is not set.");
    return [];
  }

  const commonParams: CommonQueryParams = {
    _type: "json",
    MobileOS: MOBILE_OS, // Use constant directly
    MobileApp: MOBILE_APP, // Use constant directly
    serviceKey,
  };

  const queryParams = new URLSearchParams({
    ...params,
    _type: commonParams._type,
    MobileOS: commonParams.MobileOS,
    MobileApp: commonParams.MobileApp,
    serviceKey: encodeURIComponent(commonParams.serviceKey), // Encode serviceKey
  }).toString();

  const url = `${TOUR_API_BASE_URL}/${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}, url: ${url}`);
      return [];
    }

    // --- Start of debugging modification ---
    const rawText = await response.text();
    let data: TourApiResponse<T>;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      console.error(
        `🚨 Failed to parse JSON for endpoint ${endpoint}. Raw response text:`,
        rawText
      );
      return [];
    }
    // --- End of debugging modification ---

    if (!data.response || !data.response.header) {
      console.error(
        `🚨 Unexpected API response structure for endpoint ${endpoint}. Full response object:`,
        data
      );
      return [];
    }

    if (data.response.header.resultCode !== "0000") {
      console.error(
        `TourAPI Error - Code: ${data.response.header.resultCode}, Message: ${data.response.header.resultMsg}, URL: ${url}`
      );
      return [];
    }

    const items = data.response.body.items;
    if (!items || typeof items === "string" || !("item" in items)) {
      return [];
    }
    return Array.isArray(items.item) ? items.item : [items.item]; // Ensure array format
  } catch (error) {
    console.error(`Failed to fetch from TourAPI endpoint ${endpoint}:`, error);
    return [];
  }
}

// Specific API functions
export async function fetchFestivalItems(params: {
  pageNo?: number;
  numOfRows?: number;
  eventStartDate?: string; // YYYYMMDD
  eventEndDate?: string; // YYYYMMDD - Added missing parameter
  areaCode?: string;
}): Promise<FestivalItem[]> {
  return fetchTourApi<FestivalItem>("searchFestival2", params);
}

export async function fetchDetailCommon(
  contentId: string
): Promise<DetailCommonItem | null> {
  const items = await fetchTourApi<DetailCommonItem>("detailCommon2", {
    contentId,
  });
  return items.length > 0 ? items[0] : null;
}

export async function fetchDetailIntroFestival(
  contentId: string
): Promise<FestivalIntroItem | null> {
  const items = await fetchTourApi<FestivalIntroItem>("detailIntro2", {
    contentId,
    contentTypeId: "15", // Festival/Events
  });
  return items.length > 0 ? items[0] : null;
}

export async function fetchDetailIntroCulture(
  contentId: string
): Promise<CultureIntroItem | null> {
  const items = await fetchTourApi<CultureIntroItem>("detailIntro2", {
    contentId,
    contentTypeId: "14", // Culture Facilities
  });
  return items.length > 0 ? items[0] : null;
}

export async function fetchDetailImages(
  contentId: string
): Promise<TourImageItem[]> {
  return fetchTourApi<TourImageItem>("detailImage2", {
    contentId,
    imageYN: "Y",
  });
}

/**
 * 아이 관련 행사 검색을 위한 키워드 목록
 */
const KID_FRIENDLY_KEYWORDS = [
  "어린이",
  "키즈",
  "가족",
  "유아",
  "아이",
  "체험",
  "놀이",
  "동화",
] as const;

/**
 * 키워드로 축제/행사 검색
 * @param keyword 검색 키워드
 * @param params 추가 파라미터 (pageNo, numOfRows, areaCode)
 * @returns 검색된 축제 목록
 */
export async function fetchEventsByKeyword(
  keyword: string,
  params?: {
    pageNo?: number;
    numOfRows?: number;
    areaCode?: string;
  }
): Promise<FestivalItem[]> {
  return fetchTourApi<FestivalItem>("searchKeyword2", {
    keyword: encodeURIComponent(keyword),
    contentTypeId: "15", // 축제/행사
    numOfRows: params?.numOfRows || 50,
    pageNo: params?.pageNo || 1,
    ...(params?.areaCode && { areaCode: params.areaCode }),
  });
}

/**
 * 아이 친화적 행사만 검색
 * 여러 키워드로 검색 후 중복 제거하여 반환
 * @param params 추가 파라미터
 * @returns 중복 제거된 아이 관련 축제 목록
 */
export async function fetchKidFriendlyEvents(params?: {
  numOfRows?: number;
  areaCode?: string;
}): Promise<FestivalItem[]> {
  console.log(
    `🔍 아이 친화적 행사 검색 시작 (키워드: ${KID_FRIENDLY_KEYWORDS.join(", ")})`
  );

  const allResults: FestivalItem[] = [];
  const seenContentIds = new Set<string>();

  // 각 키워드로 병렬 검색
  const searchPromises = KID_FRIENDLY_KEYWORDS.map(async (keyword) => {
    try {
      const results = await fetchEventsByKeyword(keyword, {
        numOfRows: params?.numOfRows || 30,
        areaCode: params?.areaCode,
      });
      console.log(`  - "${keyword}" 검색 결과: ${results.length}개`);
      return results;
    } catch (error) {
      console.error(`  - "${keyword}" 검색 실패:`, error);
      return [];
    }
  });

  const resultsPerKeyword = await Promise.all(searchPromises);

  // 결과 병합 및 중복 제거
  for (const results of resultsPerKeyword) {
    for (const item of results) {
      if (!seenContentIds.has(item.contentid)) {
        seenContentIds.add(item.contentid);
        allResults.push(item);
      }
    }
  }

  console.log(
    `✅ 총 ${allResults.length}개 행사 수집 (중복 제거 후)`
  );

  return allResults;
}
