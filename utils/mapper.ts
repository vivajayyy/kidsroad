// utils/mapper.ts
import {
  FestivalItem,
  DetailCommonItem,
  FestivalIntroItem,
  TourImageItem,
  CultureIntroItem,
} from "../types/tour-api";
import { TablesInsert } from "../types/supabase"; // Using TablesInsert for the target type

/**
 * Converts a TourAPI FestivalItem and its detailed information into a Supabase 'events' table insertable object.
 * @param festivalItem - The FestivalItem from searchFestival2.
 * @param commonDetail - The DetailCommonItem from detailCommon2.
 * @param introFestival - The FestivalIntroItem from detailIntro2.
 * @param images - The array of TourImageItem from detailImage2.
 * @returns An object conforming to the 'events' table insert schema.
 */
export function mapTourApiToEvent(
  festivalItem: FestivalItem,
  commonDetail: DetailCommonItem | null,
  introFestival: FestivalIntroItem | null,
  images: TourImageItem[]
): TablesInsert<"events"> {
  // --- Data Extraction and Type Conversion ---
  // Note: searchKeyword2 does not return eventstartdate/eventenddate,
  // so we need to get them from introFestival (detailIntro2) as fallback
  const eventStartDate = formatDate(
    festivalItem.eventstartdate || introFestival?.eventstartdate || ''
  );
  const eventEndDate = formatDate(
    festivalItem.eventenddate || introFestival?.eventenddate || ''
  );
  // Note: TourAPI mapx/mapy can be in FestivalItem or commonDetail. Prioritize commonDetail as it might be more accurate.
  const mapx = commonDetail?.mapx
    ? parseFloat(commonDetail.mapx)
    : festivalItem.mapx
      ? parseFloat(festivalItem.mapx)
      : null;
  const mapy = commonDetail?.mapy
    ? parseFloat(commonDetail.mapy)
    : festivalItem.mapy
      ? parseFloat(festivalItem.mapy)
      : null;

  // --- Kidsroad Specific Field Inference (Initial Basic Rules) ---
  // These will be enhanced by blog scraping and AI in Week 3 as per DATA_COVERAGE_ANALYSIS.md
  const isFree = inferIsFree(introFestival?.usetimefestival || "");
  const ageRanges = inferAgeRanges(
    festivalItem.title,
    commonDetail?.overview || ""
  );
  const isIndoor = inferIsIndoor(festivalItem.title, commonDetail?.addr1 || "");
  const isOutdoor = inferIsOutdoor(
    festivalItem.title,
    commonDetail?.addr1 || ""
  );

  // overview(상세설명)에서 시설 정보 추론
  const overviewText = commonDetail?.overview || "";
  const hasParking = inferHasParking(overviewText);
  const hasStrollerAccess = inferHasStrollerAccess(overviewText);
  const hasNursingRoom = inferHasNursingRoom(overviewText);
  const hasDiaperStation = inferHasDiaperStation(overviewText);

  // --- Assemble the Supabase Insert Object ---
  return {
    contentid: festivalItem.contentid,
    title: festivalItem.title,
    addr1: commonDetail?.addr1 || festivalItem.addr1 || null, // Prefer commonDetail
    addr2: commonDetail?.addr2 || festivalItem.addr2 || null, // Prefer commonDetail
    mapx: mapx,
    mapy: mapy,
    tel: commonDetail?.tel || festivalItem.tel || null,
    firstimage: commonDetail?.firstimage || festivalItem.firstimage || null, // Prefer commonDetail
    firstimage2: commonDetail?.firstimage2 || festivalItem.firstimage2 || null, // Prefer commonDetail
    eventstartdate: eventStartDate || '',
    eventenddate: eventEndDate || '',
    eventplace: introFestival?.eventplace || null, // From introFestival
    playtime: introFestival?.playtime || null, // From introFestival
    usetimefestival: introFestival?.usetimefestival || null, // Only from introFestival
    // TourAPI createdtime/modifiedtime are YYYYMMDDHHMMSS format, convert to ISO string
    createdtime: festivalItem.createdtime
      ? convertTourApiDateTimeToISO(festivalItem.createdtime)
      : null,
    modifiedtime: festivalItem.modifiedtime
      ? convertTourApiDateTimeToISO(festivalItem.modifiedtime)
      : null,
    description: commonDetail?.overview || null,

    // Kidsroad Specific Fields (inferred from overview text)
    age_ranges: ageRanges,
    is_free: isFree,
    is_indoor: isIndoor,
    is_outdoor: isOutdoor,
    has_parking: hasParking,
    has_stroller_access: hasStrollerAccess,
    has_nursing_room: hasNursingRoom,
    has_diaper_station: hasDiaperStation,
    category: getCategory(festivalItem.contenttypeid), // Map contentTypeId to our category
    tags: [], // To be inferred later
    data_source: "TourAPI",
    is_published: true,
  };
}

// --- Helper Functions for Inference and Formatting ---

/**
 * Formats TourAPI date string (YYYYMMDD) to YYYY-MM-DD.
 * Returns null if the date string is invalid.
 */
function formatDate(dateString: string | undefined): string | null {
  if (!dateString || dateString.length !== 8) return null;
  return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
}

/**
 * Converts TourAPI datetime string (YYYYMMDDHHMMSS) to ISO 8601 string.
 */
function convertTourApiDateTimeToISO(dateTimeString: string): string | null {
  if (!dateTimeString || dateTimeString.length !== 14) return null;
  const year = dateTimeString.substring(0, 4);
  const month = dateTimeString.substring(4, 6);
  const day = dateTimeString.substring(6, 8);
  const hour = dateTimeString.substring(8, 10);
  const minute = dateTimeString.substring(10, 12);
  const second = dateTimeString.substring(12, 14);
  try {
    // Construct a Date object from parts (month is 0-indexed)
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
    return date.toISOString();
  } catch (e) {
    console.error(
      "Failed to parse TourAPI datetime string:",
      dateTimeString,
      e
    );
    return null;
  }
}

/**
 * Infers if the event is free based on usetimefestival text.
 * As per docs/DATA_COVERAGE_ANALYSIS.md
 */
function inferIsFree(usetimefestivalText: string): boolean | null {
  const lowerText = usetimefestivalText.toLowerCase();
  if (lowerText.includes("무료") || lowerText.includes("0원")) return true;
  if (lowerText.includes("유료") || lowerText.includes("원")) return false;
  return null; // Unknown
}

/**
 * Infers age ranges from title and overview.
 * As per docs/DATA_COVERAGE_ANALYSIS.md
 */
function inferAgeRanges(title: string, overview: string): string[] {
  const text = (title + " " + overview).toLowerCase();
  const ranges: string[] = [];

  if (/영아|0세|돌/.test(text)) ranges.push("0-2");
  if (/유아|유치원|어린이집/.test(text)) ranges.push("3-5");
  if (/초등|어린이/.test(text)) ranges.push("6-9");
  if (/청소년|중학생/.test(text)) ranges.push("10+");

  // Default to common age groups if no clear indicator
  if (ranges.length === 0) {
    // Fallback: Check if commonDetail has age info (from agelimit)
    // This is a placeholder for more advanced inference in Week 3
    return ["3-5", "6-9"];
  }

  return Array.from(new Set(ranges)).sort(); // Ensure unique and sorted
}

/**
 * Infers if the event is indoor from title and address.
 * As per docs/DATA_COVERAGE_ANALYSIS.md
 */
function inferIsIndoor(title: string, addr: string): boolean | null {
  const lowerText = (title + " " + addr).toLowerCase();
  if (/실내|전시관|박물관|미술관|공연장|극장|센터/.test(lowerText)) return true;
  if (/야외|공원|해변|강변|거리|광장|축제/.test(lowerText)) return false; // Added '축제' as often outdoor
  return null; // Unknown
}

/**
 * Infers if the event is outdoor from title and address.
 * As per docs/DATA_COVERAGE_ANALYSIS.md
 */
function inferIsOutdoor(title: string, addr: string): boolean | null {
  const lowerText = (title + " " + addr).toLowerCase();
  if (/야외|공원|해변|강변|거리|광장|축제/.test(lowerText)) return true; // Added '축제' as often outdoor
  if (/실내|전시관|박물관|미술관|공연장|극장|센터/.test(lowerText))
    return false;
  return null; // Unknown
}

/**
 * Infers parking availability from overview text.
 * 주차장, 주차 가능 등의 언급이 있으면 true
 */
function inferHasParking(text: string): boolean | null {
  const lowerText = text.toLowerCase();
  // 주차 관련 긍정적 키워드
  if (/주차장|주차\s*가능|무료\s*주차|주차\s*시설/.test(lowerText)) return true;
  // 주차 불가 키워드
  if (/주차\s*불가|주차\s*어려|주차장\s*없/.test(lowerText)) return false;
  return null; // Unknown
}

/**
 * Infers stroller access from overview text.
 * 유모차 대여, 베리어프리 등의 언급이 있으면 true
 */
function inferHasStrollerAccess(text: string): boolean | null {
  const lowerText = text.toLowerCase();
  // 유모차 관련 긍정적 키워드
  if (/유모차\s*대여|유모차\s*가능|유모차\s*ok|베리어프리|배리어프리|휠체어/.test(lowerText)) return true;
  // 유모차 불가 키워드
  if (/유모차\s*불가|유모차\s*반입\s*금지|계단\s*많|경사\s*심/.test(lowerText)) return false;
  return null; // Unknown
}

/**
 * Infers nursing room availability from overview text.
 * 수유실, 모유수유 등의 언급이 있으면 true
 */
function inferHasNursingRoom(text: string): boolean | null {
  const lowerText = text.toLowerCase();
  // 수유실 관련 키워드
  if (/수유실|수유\s*공간|모유\s*수유|nursing\s*room/.test(lowerText)) return true;
  return null; // Unknown (수유실 없다고 명시하는 경우는 드뭄)
}

/**
 * Infers diaper station availability from overview text.
 * 기저귀 교환대 등의 언급이 있으면 true
 */
function inferHasDiaperStation(text: string): boolean | null {
  const lowerText = text.toLowerCase();
  // 기저귀 교환대 관련 키워드
  if (/기저귀\s*교환|기저귀\s*갈|기저귀\s*대|diaper/.test(lowerText)) return true;
  return null; // Unknown
}

/**
 * Maps TourAPI contentTypeId to Kidsroad category.
 */
function getCategory(contentTypeId: string): string | null {
  switch (contentTypeId) {
    case "15":
      return "축제/행사";
    case "14":
      return "문화시설";
    case "12":
      return "관광지";
    case "25":
      return "여행코스";
    case "28":
      return "레포츠";
    case "32":
      return "숙박";
    case "38":
      return "쇼핑";
    case "39":
      return "음식점";
    default:
      return null;
  }
}
