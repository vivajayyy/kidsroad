// app/page.tsx

export default function Home() {
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

      {/* 
          그리드 레이아웃 도입 (반응형의 핵심!)
          - 기본: 1열 (모바일)
          - md: 2열 (태블릿/PC)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 임시 콘텐츠 카드 */}
        <div className="aspect-[4/3] bg-pink-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-pink-200">
          <p className="text-pink-400 font-medium">✨ 곧 멋진 행사 리스트가 보일 거예요!</p>
        </div>

        {/* 인기 필터 섹션 */}
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
      </div>
    </div>
  );
}
