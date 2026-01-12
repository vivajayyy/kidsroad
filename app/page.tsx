// app/page.tsx
import { getEvents, Event } from '../lib/events';
import EventCard from '../components/EventCard'; // EventCard 컴포넌트 가져오기

export default async function Home() {
  const events = await getEvents({ pageSize: 11 }); // 인기 필터 카드 공간을 고려하여 11개 가져오기
  // console.log('Fetched events:', events); // 서버 측 콘솔에 이벤트 로깅 (디버깅용)

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8">
      {/* 환영 인사: 데스크톱에서도 중앙 정렬 */}
      <section className="py-12 md:py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight">
          아이와 함께하는 <span className="text-pink-500">지연님</span>의 오늘을 <br />
          키즈로드가 응원해요!
        </h2>
        <p className="mt-4 text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
          주말에 어디 갈지 고민이신가요? 딱 맞는 행사만 골라왔어요.
        </p>
      </section>

      {/* 이벤트 카드 그리드: xl 화면에서 4열 적용 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.contentid} event={event} />
          ))
        ) : (
          // 이벤트가 없을 경우 표시될 내용 (Empty State)
          <div className="col-span-full aspect-video bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 font-medium">
            <p>✨ 현재 추천할 만한 행사가 없습니다.</p>
          </div>
        )}

        {/* 인기 필터 섹션 */}
        <div className="p-6 bg-slate-50 rounded-2xl flex flex-col justify-center">
            <p className="text-slate-600 text-base font-semibold mb-4">이번 주 인기 필터</p>
            <div className="flex flex-wrap gap-2">
              <span className="cursor-pointer px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors">#무료</span>
              <span className="cursor-pointer px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors">#수유실있음</span>
              <span className="cursor-pointer px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors">#실내체험</span>
              <span className="cursor-pointer px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors">#주차편함</span>
              <span className="cursor-pointer px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors">#연령_0-2세</span>
            </div>
        </div>
      </div>
    </div>
  );
}
