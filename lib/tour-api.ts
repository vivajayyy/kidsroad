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
