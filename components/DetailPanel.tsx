'use client';

import Image from 'next/image';
import type { Event } from '../lib/events';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DetailPanelProps {
  event: Event | null;
  onClickClose: () => void;
}

export default function DetailPanel({ event, onClickClose }: DetailPanelProps) {
  if (!event) {
    return null;
  }

  const imageUrl = event.firstimage || event.firstimage2 || '/images/default-event-thumbnail.jpg';
  const startDate = event.eventstartdate ? format(new Date(event.eventstartdate), 'yyyy.MM.dd (eee)', { locale: ko }) : '날짜 미정';
  const endDate = event.eventenddate ? format(new Date(event.eventenddate), 'yyyy.MM.dd (eee)', { locale: ko }) : '날짜 미정';

  const parentalChecklistItems = [
    { condition: event.has_parking, icon: 'local_parking', label: '주차 가능' },
    { condition: event.has_nursing_room, icon: 'baby_changing_station', label: '수유실' },
    { condition: event.has_stroller_access, icon: 'stroller', label: '유모차 접근성' },
    { condition: event.is_free, icon: 'payments', label: '무료 입장' },
  ];

  return (
    <div className="relative w-full h-full bg-white dark:bg-[#161616] overflow-y-auto custom-scrollbar">
      <div className="relative w-full h-[45vh]">
        <Image src={imageUrl} alt={event.title || '이벤트 이미지'} fill style={{ objectFit: 'cover' }} priority />
        <div className="absolute top-6 right-6 z-10">
          <button onClick={onClickClose} className="bg-white/90 dark:bg-black/80 backdrop-blur p-2 rounded-full shadow-lg">
            <span className="material-symbols-outlined text-primary dark:text-white">close</span>
          </button>
        </div>
      </div>
      <div className="p-10">
        <h2 className="text-3xl font-medium mb-3">{event.title}</h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{event.description || '상세 설명이 없습니다.'}</p>
        <div className="my-12">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Parental Checklist</h3>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            {parentalChecklistItems.filter(item => item.condition).map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 border border-gray-100 dark:border-gray-800 flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined text-sage-600 font-light text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-[12px] font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 mb-12">
          <div className="flex justify-between py-4 border-b border-gray-50 dark:border-gray-800">
            <span className="text-xs text-gray-400">Location</span>
            <span className="text-xs font-medium">{event.addr1 || '장소 정보 없음'}</span>
          </div>
          <div className="flex justify-between py-4 border-b border-gray-50 dark:border-gray-800">
            <span className="text-xs text-gray-400">Schedule</span>
            <span className="text-xs font-medium">{startDate} {startDate !== endDate ? `~ ${endDate}` : ''}</span>
          </div>
          {event.usetimefestival && (
            <div className="flex justify-between py-4 border-b border-gray-50 dark:border-gray-800">
              <span className="text-xs text-gray-400">Entry Fee</span>
              <span className="text-xs font-medium">{event.usetimefestival}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}