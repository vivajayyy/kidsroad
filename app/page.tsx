// app/page.tsx

export default function Home() {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 환영 인사 섹션 */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
          아이와 함께하는 <br />
          <span className="text-pink-500">지연님</span>의 오늘을 <br />
          키즈로드가 응원해요!
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          주말에 어디 갈지 고민이신가요? <br />딱 맞는 행사만 골라왔어요.
        </p>
      </section>

      {/* 임시 콘텐츠 카드 (나중에 실제 데이터로 채울 부분) */}
      <div className="aspect-[4/3] bg-pink-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-pink-200">
        <p className="text-pink-400 font-medium">
          ✨ 곧 멋진 행사 리스트가 보일 거예요!
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-slate-600 text-sm font-semibold">
          이번 주 인기 필터
        </p>
        <div className="flex gap-2 mt-2">
          <span className="px-3 py-1 bg-white border rounded-full text-xs text-slate-500">
            #무료
          </span>
          <span className="px-3 py-1 bg-white border rounded-full text-xs text-slate-500">
            #수유실있음
          </span>
          <span className="px-3 py-1 bg-white border rounded-full text-xs text-slate-500">
            #실내체험
          </span>
        </div>
      </div>
    </div>
  );
}
