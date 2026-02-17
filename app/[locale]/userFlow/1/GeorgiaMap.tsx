"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Free map of Georgia using Leaflet + CartoDB Voyager tiles (clean, no API key).
 * Rendered only on client to avoid SSR issues with Leaflet.
 */
export default function GeorgiaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const L = require("leaflet");

    if (mapRef.current) return;
    mapRef.current = L.map(containerRef.current, {
      center: [42.32, 43.36],
      zoom: 6,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(mapRef.current);

    // CartoDB Voyager — clean, free, no API key
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-gray-100 [&_.leaflet-control-attribution]:!text-[10px] [&_.leaflet-control-zoom]:!border-0"
    />
  );
}
