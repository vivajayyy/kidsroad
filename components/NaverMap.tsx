/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { Event } from "@/lib/events";

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

export default function NaverMap({ events, onEventSelect }: NaverMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const initMap = () => {
      if (!window.naver || !mapElement.current) return;

      const { naver } = window;

      // Initialize map if not already
      if (!mapRef.current) {
        const initialCenter =
          events.length > 0 && events[0].mapy && events[0].mapx
            ? new naver.maps.LatLng(events[0].mapy, events[0].mapx)
            : new naver.maps.LatLng(37.5665, 126.978); // Seoul City Hall

        const mapOptions = {
          center: initialCenter,
          zoom: 10,
          zoomControl: true,
          zoomControlOptions: {
            position: naver.maps.Position.TOP_RIGHT,
          },
        };
        mapRef.current = new naver.maps.Map(mapElement.current, mapOptions);
      }

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      const map = mapRef.current;
      const bounds = new naver.maps.LatLngBounds();
      let hasValidMarker = false;

      events.forEach((event) => {
        if (!event.mapy || !event.mapx) return;

        const position = new naver.maps.LatLng(event.mapy, event.mapx);
        bounds.extend(position);
        hasValidMarker = true;

        const marker = new naver.maps.Marker({
          position: position,
          map: map,
          title: event.title,
        });

        const infoWindow = new naver.maps.InfoWindow({
          content: `
              <div style="padding:12px;min-width:200px;line-height:1.5;">
                <h4 style="font-weight:bold; margin-bottom:4px; color: #333;">${event.title}</h4>
                <p style="font-size:13px; color:#666;">${event.addr1 || "주소 없음"}</p>
              </div>
            `,
          borderColor: "#E5E7EB",
          borderWidth: 1,
          backgroundColor: "white",
          anchorSize: new naver.maps.Size(10, 10),
          anchorSkew: true,
          anchorColor: "white",
        });

        markersRef.current.push(marker);

        naver.maps.Event.addListener(marker, "click", function () {
          if (onEventSelect) {
            onEventSelect(event);
          }
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        });
      });

      // Fit bounds if we have markers
      if (hasValidMarker) {
        map.fitBounds(bounds, {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        });
      }
    };

    const interval = setInterval(() => {
      if (window.naver && window.naver.maps) {
        clearInterval(interval);
        initMap();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [events, onEventSelect]);

  return (
    <div
      ref={mapElement}
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
    />
  );
}
