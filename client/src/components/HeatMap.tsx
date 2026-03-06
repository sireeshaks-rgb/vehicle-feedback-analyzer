import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, Bus, Train, Plane, Info, Sparkles } from "lucide-react";
import L from "leaflet";
import { useAuth } from "@/hooks/use-auth";

interface HotSpot {
    location: string;
    lat: number;
    lng: number;
    count: number;
    topIssue: string;
    narrative: string;
    mode: string;
}

// Demo data fallback
const DEMO_HOTSPOTS: HotSpot[] = [
    { location: "Delhi", lat: 28.6139, lng: 77.209, count: 8, topIssue: "Overcrowding", narrative: "Peak-hour overcrowding on major bus corridors in central Delhi. Passengers report inability to board during 8-9 AM rush. AC failures compound the situation in summer months.", mode: "Bus" },
    { location: "Mumbai", lat: 19.076, lng: 72.8777, count: 5, topIssue: "Delays", narrative: "Consistent train delays on the Western line between Churchgate and Borivali. Signal failures at Dadar junction identified as the primary bottleneck affecting 40k daily commuters.", mode: "Train" },
    { location: "Hyderabad", lat: 17.385, lng: 78.4867, count: 3, topIssue: "Cleanliness", narrative: "Cleanliness complaints concentrated around the Secunderabad terminal. Feedback indicates inadequate waste disposal facilities on platform 3 and 4 during evening peak.", mode: "Train" },
    { location: "Bangalore", lat: 12.9716, lng: 77.5946, count: 4, topIssue: "Safety", narrative: "Safety concerns reported at Majestic bus terminal after 10 PM. Insufficient lighting in parking areas and lack of security personnel flagged by female commuters.", mode: "Bus" },
    { location: "Kolkata", lat: 22.5726, lng: 88.3639, count: 6, topIssue: "Fare Issues", narrative: "Fare discrepancies reported on auto-rickshaw routes from Howrah to Salt Lake. Passengers report overcharging during rain events. Digital payment acceptance remains low.", mode: "Bus" },
    { location: "Chennai", lat: 13.0827, lng: 80.2707, count: 3, topIssue: "Accessibility", narrative: "Accessibility issues at Chennai Central. Wheelchair ramps non-functional at the south entrance. Elderly passengers report difficulty navigating overhead bridges.", mode: "Train" },
    { location: "Pune", lat: 18.5204, lng: 73.8567, count: 2, topIssue: "Schedule", narrative: "Irregular bus schedules on Hinjewadi IT park routes. Waiting times exceed 30 minutes during non-peak hours driving passengers to ride-sharing alternatives.", mode: "Bus" },
    { location: "Ahmedabad", lat: 23.0225, lng: 72.5714, count: 4, topIssue: "AC Failure", narrative: "BRTS air conditioning failures during afternoon hours. Temperature inside buses recorded above 42°C. Maintenance teams stretched thin across 120+ vehicles.", mode: "Bus" },
];

function severityColor(count: number): string {
    if (count >= 6) return "#ef4444";
    if (count >= 4) return "#f97316";
    return "#fbbf24";
}

function severityBg(count: number) {
    if (count >= 6) return "bg-red-500";
    if (count >= 4) return "bg-orange-500";
    return "bg-amber-400";
}

const modeIcon = (mode: string) => {
    if (mode === "Bus") return <Bus className="w-4 h-4" />;
    if (mode === "Train") return <Train className="w-4 h-4" />;
    return <Plane className="w-4 h-4" />;
};

const MODE_EMOJI: Record<string, string> = { Bus: "🚌", Train: "🚆", Airplane: "✈️" };

export function HeatMap() {
    const { user } = useAuth();
    const [hotspots, setHotspots] = useState<HotSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<HotSpot | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) { setHotspots(DEMO_HOTSPOTS); setLoading(false); return; }
        fetch("/api/analytics/heatmap", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => {
                const result = Array.isArray(data) && data.length > 0 ? data : DEMO_HOTSPOTS;
                setHotspots(result);
                setLoading(false);
            })
            .catch(() => {
                setHotspots(DEMO_HOTSPOTS);
                setLoading(false);
            });
    }, []);

    // Initialize Leaflet map
    useEffect(() => {
        if (loading || !mapRef.current || leafletMap.current) return;

        const map = L.map(mapRef.current, {
            center: [22.5, 78.5],
            zoom: 5,
            zoomControl: false,
            attributionControl: false,
        });

        // Dark CARTO tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            subdomains: "abcd",
            maxZoom: 19,
        }).addTo(map);

        // Add zoom control to bottom-left
        L.control.zoom({ position: "bottomleft" }).addTo(map);

        leafletMap.current = map;

        return () => {
            map.remove();
            leafletMap.current = null;
        };
    }, [loading]);

    // Add markers whenever hotspots change
    useEffect(() => {
        const map = leafletMap.current;
        if (!map || hotspots.length === 0) return;

        const markers: L.Layer[] = [];

        hotspots.forEach((spot) => {
            const color = severityColor(spot.count);
            const radius = 10 + spot.count * 2;

            // Outer glow ring for high-severity
            if (spot.count >= 5) {
                const glow = L.circleMarker([spot.lat, spot.lng], {
                    radius: radius + 14,
                    fillColor: color,
                    fillOpacity: 0.12,
                    color: "transparent",
                    interactive: false,
                }).addTo(map);
                markers.push(glow);
            }

            // Main circle marker
            const circle = L.circleMarker([spot.lat, spot.lng], {
                radius: radius,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.35,
            }).addTo(map);

            // Popup
            const emoji = MODE_EMOJI[spot.mode] || "🚍";
            circle.bindPopup(`
                <div style="min-width:200px;font-family:inherit;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <span style="font-size:18px;">${emoji}</span>
                        <strong style="font-size:14px;text-transform:capitalize;">${spot.location}</strong>
                    </div>
                    <p style="font-size:12px;margin:4px 0;color:#64748b;"><strong>${spot.count}</strong> reports · Issue: <strong>${spot.topIssue}</strong></p>
                    <p style="font-size:12px;color:#94a3b8;line-height:1.5;">${spot.narrative.slice(0, 120)}…</p>
                </div>
            `, { className: "custom-popup", maxWidth: 280 });

            circle.on("click", () => {
                setSelected(spot);
            });

            markers.push(circle);
        });

        // Fit bounds
        const bounds = L.latLngBounds(hotspots.map(s => [s.lat, s.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.3), { maxZoom: 7 });

        return () => {
            markers.forEach(m => map.removeLayer(m));
        };
    }, [hotspots]);

    const displaySpots = hotspots.length > 0 ? hotspots : DEMO_HOTSPOTS;

    return (
        <div className="space-y-8">
            {/* Map container */}
            <div className="relative w-full h-[580px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-[1000]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary/60">Scanning Nodes...</span>
                        </div>
                    </div>
                )}

                {/* Map label */}
                <div className="absolute top-6 left-6 flex items-center gap-3 z-[500] bg-slate-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-white/70 text-[10px] font-black tracking-[0.3em] uppercase">India Hub Intelligence Network</span>
                </div>

                {/* Legend */}
                <div className="absolute bottom-6 right-6 z-[500] bg-slate-950/70 backdrop-blur-2xl p-5 rounded-2xl space-y-2.5 border border-white/10 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Node Severity</p>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-white/80"><div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Critical (6+)</div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-white/80"><div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" /> Warning (4-5)</div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-white/80"><div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> Advisory (1-3)</div>
                </div>

                {/* Leaflet map mounts here */}
                <div ref={mapRef} className="w-full h-full" />
            </div>

            {/* AI Hotspot Narrative Panel */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative glass-card border-primary/20 rounded-[2.5rem] p-10 overflow-hidden shadow-3xl bg-white/90 dark:bg-slate-900/90"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-32 translate-x-32" />
                        <button onClick={() => setSelected(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground transition-all z-10">×</button>

                        <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-2xl shadow-primary/30 shrink-0">
                                {modeIcon(selected.mode)}
                            </div>
                            <div>
                                <h3 className="text-3xl font-display font-black tracking-tight capitalize mb-1">{selected.location} Node Analysis</h3>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        <Info className="w-3 h-3" /> {selected.count} Reports Detected
                                    </span>
                                    <span className="text-sm font-bold text-muted-foreground">Primary Friction: <span className="text-foreground">{selected.topIssue}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-8 items-start relative z-10">
                            <div className="w-1.5 bg-gradient-to-b from-primary via-accent to-pink-500 rounded-full h-24 shrink-0 mt-1 shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Narrative Summary</p>
                                </div>
                                <p className="text-base font-bold leading-relaxed text-foreground/90 max-w-4xl">{selected.narrative}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hotspot Cards */}
            {displaySpots.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displaySpots.map((spot, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="relative p-8 rounded-[2rem] glass-card border-white/20 cursor-pointer overflow-hidden group/item"
                            onClick={() => setSelected(spot)}
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-xl transition-colors group-hover/item:bg-primary/10" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-4 h-4 rounded-full ${severityBg(spot.count)} shadow-lg shadow-black/10`} />
                                <span className="text-xl font-display font-black tracking-tight capitalize">{spot.location}</span>
                                <span className="ml-auto text-lg">{MODE_EMOJI[spot.mode] || "🚍"}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{spot.count} Hits</span>
                            </div>
                            <p className="text-xs font-semibold text-primary/80 mb-2 uppercase tracking-wider">Issue: {spot.topIssue}</p>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-3 group-hover/item:text-foreground transition-colors">{spot.narrative}</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
