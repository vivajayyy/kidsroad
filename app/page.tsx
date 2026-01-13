"use client";

import React, { useState } from 'react';
import Image from 'next/image';

// --- Types (간소화) ---
interface Event {
  id: number;
  title: string;
  fullTitle?: string;
  age: string;
  location: string;
  fullLocation?: string;
  description?: string;
  image: string;
  tags?: string[];
  schedule?: string;
  fee?: string;
  checklist: {
    icon: string;
    label: string;
    sub: string;
  }[];
}

// --- Mock Data ---
const EVENTS: Event[] = [
  { id: 1, title: "Modern Forest Atelier", age: "Age 4-7", location: "Seongsu-dong, Seoul", image: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=800&auto=format&fit=crop", checklist: [] },
  {
    id: 2,
    title: "Architecture for Kids",
    fullTitle: "Architecture for Kids: Bauhaus Session",
    age: "All Ages",
    location: "Pyeongchang-dong, Seoul",
    fullLocation: "Pyeongchang-dong 12-4, Seoul",
    description: "A curated workshop focused on spatial awareness and minimalist design principles for young creators. Led by professional architects in a light-filled studio environment.",
    image: "https://images.unsplash.com/photo-1518005020480-1097c009716e?q=80&w=800&auto=format&fit=crop",
    tags: ["Design", "Education"],
    schedule: "Sat - Sun | 11:00, 14:00, 16:00",
    fee: "₩45,000 (Incl. materials)",
    checklist: [
      { icon: "local_parking", label: "Valet Parking", sub: "Available on-site" },
      { icon: "baby_changing_station", label: "Nursing Room", sub: "Premium facilities" },
      { icon: "restaurant", label: "Kids Cafe", sub: "Organic menu" },
      { icon: "stroller", label: "Stroller Access", sub: "Barrier free" },
    ]
  },
  { id: 3, title: "Beige Sensory Play", age: "Age 0-3", location: "Hannam-dong, Seoul", image: "https://images.unsplash.com/photo-1554232456-8727a67032ba?q=80&w=800&auto=format&fit=crop", checklist: [] },
  { id: 4, title: "Minimal Ceramic Class", age: "Age 5+", location: "Yeonnam-dong, Seoul", image: "https://images.unsplash.com/photo-1565193566174-933c9f702e23?q=80&w=800&auto=format&fit=crop", checklist: [] },
  { id: 5, title: "Gourmet Little Chef", age: "Age 3-10", location: "Cheongdam-dong, Seoul", image: "https://images.unsplash.com/photo-1600565193348-f74d3c2723a9?q=80&w=800&auto=format&fit=crop", checklist: [] },
  { id: 6, title: "The Digital Lab", age: "Age 6+", location: "Gangnam, Seoul", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop", checklist: [] },
];

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-5 border-b border-gray-100 dark:border-gray-800">
      <span className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-[12px] font-medium text-right">{value}</span>
    </div>
  );
}

export default function KidsroadPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(EVENTS[1]);

  return (
    <>
      <main className="pt-24 pb-12 px-8 max-w-[1440px] mx-auto flex gap-8">
        {/* --- Left Content: Event Grid --- */}
        <section className={`transition-all duration-500 ease-in-out ${selectedEvent ? 'w-full lg:w-3/5' : 'w-full'}`}>
          <div className="mb-10">
            <h2 className="text-3xl font-light mb-2">Curated for your weekend.</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Minimalist discovery of children's premium experiences.</p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out ${selectedEvent ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
            {EVENTS.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`bg-white dark:bg-[#1E1E1E] p-8 rounded-xl card-hover cursor-pointer group shadow-sm border ${selectedEvent?.id === event.id ? 'border-primary dark:border-primary' : 'border-gray-100 dark:border-gray-800'}`}
              >
                <div className="flex justify-between items-start mb-16">
                  <span className="text-[10px] uppercase tracking-widest text-sage-600 font-bold bg-sage-50 dark:bg-sage-600/20 px-2.5 py-1 rounded-md">
                    {event.age}
                  </span>
                  <span className={`material-symbols-outlined text-[20px] ${selectedEvent?.id === event.id ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`}>
                    bookmark
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-1.5">{event.title}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {event.location}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Right Content: Sliding Side Panel --- */}
        <aside className={`hidden lg:block w-2/5 fixed right-0 top-0 h-screen bg-white dark:bg-[#161616] shadow-2xl z-[60] border-l border-gray-100 dark:border-gray-800 overflow-y-auto custom-scrollbar transition-transform duration-500 ease-in-out ${selectedEvent ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedEvent && (
            <>
              <div className="relative h-[45vh] w-full">
                <Image 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 40vw, 480px"
                />
                <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur p-2 rounded-full shadow-lg">
                  <span className="material-symbols-outlined text-primary dark:text-white">close</span>
                </button>
                <div className="absolute bottom-6 left-6 flex gap-2">
                  {selectedEvent.tags?.map(tag => (
                    <span key={tag} className="bg-white/90 dark:bg-black/80 px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-10">
                <h2 className="text-3xl font-medium leading-tight mb-4">
                  {selectedEvent.fullTitle || selectedEvent.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed font-light mb-12">
                  {selectedEvent.description}
                </p>

                {selectedEvent.checklist.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-8">Parental Checklist</h3>
                    <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                      {selectedEvent.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-10 h-10 border border-gray-100 dark:border-gray-700 flex items-center justify-center rounded-lg text-sage-600">
                            <span className="material-symbols-outlined font-light">{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-[12px] font-medium">{item.label}</p>
                            <p className="text-[11px] text-gray-400">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mb-12 space-y-0">
                  <DetailRow label="Location" value={selectedEvent.fullLocation || selectedEvent.location} />
                  <DetailRow label="Schedule" value={selectedEvent.schedule || ""} />
                  <DetailRow label="Fee" value={selectedEvent.fee || ""} />
                </div>

                <button className="w-full bg-primary text-white py-5 rounded font-medium tracking-widest uppercase text-xs hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-xl">
                  Apply for Session
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </>
          )}
        </aside>
      </main>
    </>
  );
}
