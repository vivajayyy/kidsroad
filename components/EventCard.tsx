'use client';

import Image from 'next/image';
import type { Event } from '../lib/events';
import { format } from 'date-fns'; // date-fns 라이브러리를 사용 (설치되어 있다고 가정)
import { ko } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const imageUrl = event.firstimage || event.firstimage2 || '/images/default-event-thumbnail.jpg'; // 원본 이미지를 우선 사용
  const startDate = event.eventstartdate ? format(new Date(event.eventstartdate), 'yyyy.MM.dd', { locale: ko }) : '날짜 미정';
  const endDate = event.eventenddate ? format(new Date(event.eventenddate), 'yyyy.MM.dd', { locale: ko }) : '날짜 미정';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={imageUrl}
          alt={event.title || '이벤트 이미지'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          priority={false} // 필요에 따라 변경
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[56px]">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {startDate} {event.eventstartdate && event.eventenddate && startDate !== endDate ? `~ ${endDate}` : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {event.is_free && (
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">무료</span>
          )}
          {event.age_ranges && event.age_ranges.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {event.age_ranges.join(', ')}
            </span>
          )}
          {event.is_indoor && (
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded-full">실내</span>
          )}
          {event.has_parking && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded-full">주차</span>
          )}
          {/* 다른 태그들도 여기에 추가 */}
        </div>
      </div>
    </div>
  );
}
