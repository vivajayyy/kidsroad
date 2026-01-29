/**
 * 키워드 검색 API 테스트
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

async function testKeywordSearch(keyword: string) {
  const serviceKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;

  if (!serviceKey) {
    console.error('API 키 없음');
    return;
  }

  // URL 직접 구성
  const params = new URLSearchParams({
    serviceKey: serviceKey,
    keyword: keyword,
    contentTypeId: '15', // 축제/행사
    numOfRows: '10',
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'Kidsroad',
    _type: 'json',
  });

  const url = `${TOUR_API_BASE_URL}/searchKeyword2?${params.toString()}`;

  console.log(`\n🔍 "${keyword}" 검색...`);
  console.log(`URL: ${url.substring(0, 100)}...`);

  try {
    const response = await fetch(url);
    const text = await response.text();

    console.log(`응답 상태: ${response.status}`);
    console.log(`응답 내용: ${text.substring(0, 500)}`);

    const data = JSON.parse(text);
    if (data.response?.body?.items?.item) {
      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];
      console.log(`결과: ${items.length}개`);
      items.slice(0, 3).forEach((item: any) => {
        console.log(`  - ${item.title}`);
      });
    } else {
      console.log('결과 없음');
    }
  } catch (e) {
    console.error('에러:', e);
  }
}

// 기존 searchFestival2도 테스트
async function testFestivalSearch() {
  const serviceKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;

  const today = new Date();
  const eventStartDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

  const params = new URLSearchParams({
    serviceKey: serviceKey!,
    eventStartDate,
    numOfRows: '10',
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'Kidsroad',
    _type: 'json',
  });

  const url = `${TOUR_API_BASE_URL}/searchFestival2?${params.toString()}`;

  console.log(`\n📅 축제 검색 (${eventStartDate}부터)...`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.body?.items?.item) {
      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];
      console.log(`결과: ${items.length}개`);
      items.slice(0, 5).forEach((item: any) => {
        console.log(`  - ${item.title}`);
      });
    } else {
      console.log('결과 없음');
      console.log(JSON.stringify(data, null, 2).substring(0, 500));
    }
  } catch (e) {
    console.error('에러:', e);
  }
}

async function main() {
  console.log('=== TourAPI 검색 테스트 ===\n');

  // 축제 검색 테스트
  await testFestivalSearch();

  // 키워드 검색 테스트
  await testKeywordSearch('어린이');
  await testKeywordSearch('축제');
}

main();
