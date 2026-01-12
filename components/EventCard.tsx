'use client';

import type { Event } from '../lib/events';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
}

const formatAgeRanges = (ranges: string[] | null): string => {
    if (!ranges || ranges.length === 0) return 'All Ages';
    const numbers = ranges.flatMap(r => r.split('-')).map(Number).filter(n => !isNaN(n));
    if (numbers.length === 0) return 'All Ages';
    
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    if (min === max) return `Age ${min}+`;
    return `Age ${min}-${max}`;
}

export default function EventCard({ event }: EventCardProps) {
  const ageRangesText = formatAgeRanges(event.age_ranges);

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 p-8 rounded-xl card-hover cursor-pointer group shadow-sm">
      <div className="flex justify-between items-start mb-12">
        <span className="text-[10px] uppercase tracking-widest text-sage-600 font-bold bg-sage-50 dark:bg-sage-600/10 px-2 py-1 rounded">
          {ageRangesText}
        </span>
        <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">
          bookmark
        </span>
      </div>
      <h3 className="text-xl font-medium mb-1">{event.title}</h3>
      <p className="text-gray-400 text-sm mb-0 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">location_on</span>
        {event.addr1?.split(' ').slice(0, 2).join(' ') || '장소 미정'}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        {format(new Date(event.eventstartdate), 'yyyy.MM.dd', { locale: ko })} 
        {event.eventenddate && event.eventstartdate !== event.eventenddate ? ` ~ ${format(new Date(event.eventenddate), 'yyyy.MM.dd', { locale: ko })}` : ''}
      </p>
    </div>
  );
}
