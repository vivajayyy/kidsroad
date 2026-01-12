// app/page.tsx
import { getEvents, Event } from '../lib/events';
import EventCard from '../components/EventCard'; // EventCard 컴포넌트 가져오기

export default async function Home() {
  const events = await getEvents({ pageSize: 5 }); // 최대 5개의 이벤트 가져오기
  // console.log('Fetched events:', events); // 서버 측 콘솔에 이벤트 로깅 (디버깅용)

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 환영 인사: 큰 화면에서는 텍스트가 더 커지도록 md:text-4xl 적용 */}
      <section className="py-8 md:py-16 text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-800 leading-tight">
          아이와 함께하는 <span className="text-pink-500">지연님</span>의 오늘을 <br className="hidden md:block" />
          키즈로드가 응원해요!
        </h2>
        <p className="mt-2 text-slate-500 text-sm md:text-base">
          주말에 어디 갈지 고민이신가요? 딱 맞는 행사만 골라왔어요.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.contentid} event={event} />
          ))
        ) : (
          // 이벤트가 없을 경우 표시될 내용 (Empty State)
          <div className="col-span-full aspect-[4/3] bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 font-medium">
            <p>✨ 현재 추천할 만한 행사가 없습니다.</p>
          </div>
        )}

        {/* 인기 필터 섹션 (이전 코드에서 이동 또는 수정될 수 있음) */}
        {/*
        <div className="flex flex-col gap-4">
          <div className="p-6 bg-slate-50 rounded-2xl h-full">
            <p className="text-slate-600 text-base font-semibold">이번 주 인기 필터</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-300 transition-colors">#무료</span>
              <span className="px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-300 transition-colors">#수유실있음</span>
              <span className="px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-300 transition-colors">#실내체험</span>
              <span className="px-4 py-2 bg-white border rounded-full text-sm text-slate-500 hover:border-pink-300 transition-colors">#주차편함</span>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}
