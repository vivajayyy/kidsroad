import { createClient } from '@supabase/supabase-js';
import React from 'react';
import Image from 'next/image';
import type { Database } from '@/types/supabase';
import EventView from '@/components/EventView';

export const revalidate = 3600; // 1시간마다 데이터 재검증

export default async function Home() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('eventstartdate', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>표시할 이벤트가 없습니다.</p>
      </div>
    );
  }

  return <EventView events={events} />;
}

