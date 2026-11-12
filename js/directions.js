// js/directions.js
//
// Free "get directions" deep links to Google Maps — NOT the paid Maps
// JavaScript/Directions/Places API. We build a plain URL; Google Maps (app
// or web) does the geocoding/routing on the visitor's own device when they
// open it. No API key, no billing, no quota.
// Docs: https://developers.google.com/maps/documentation/urls/get-started
//
// Origin priority, all free:
//   1. The visitor's live location, via the browser's own Geolocation API
//      (a standard web API — nothing to do with Google's paid APIs).
//   2. If they deny/skip that (or it's unsupported/slow), their university
//      gate, if their account badge is one of the three known schools.
//   3. Otherwise, no origin at all — Google Maps decides (its own prompt,
//      or the visitor types a starting point themselves).

// Main-gate coordinates, looked up via Google Places:
//   FTU: 91 P. Chùa Láng, Láng, Hà Nội
//   DAV: 69 P. Chùa Láng, Láng, Hà Nội
//   VYA (Học viện Thanh thiếu niên Việt Nam): 58 Đ. Nguyễn Chí Thanh, Láng, Hà Nội
// These are each school's main listed pin, which may sit a few meters from
// the exact gate students walk out of — nudge the numbers if you know the
// real gate is around a corner.
export const UNIVERSITY_GATES = {
    "FTUer Verified": "21.023033,105.805437",
    "DAVer Verified": "21.022984,105.806509",
    "VYAer Verified": "21.022332,105.809333",
};

function buildMapsUrl(spot, origin) {
    const hasCoords = typeof spot.lat === "number" && typeof spot.lng === "number";
    const destination = hasCoords ? `${spot.lat},${spot.lng}` : (spot.address || "");
    if (!destination) return null;

    const params = new URLSearchParams({
        api: "1",
        destination,
        travelmode: "walking",
    });
    if (origin) params.set("origin", origin);

    return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// Call this straight from a click handler (never after an `await`) — it
// pre-opens the destination tab synchronously so browsers don't treat the
// later redirect as a popup, then fills in the best origin it can get.
export function openDirections(spot, badge) {
    const gateOrigin = UNIVERSITY_GATES[badge] || null;
    const fallbackUrl = buildMapsUrl(spot, gateOrigin);
    if (!fallbackUrl) return;

    const win = window.open("about:blank", "_blank");
    const go = (url) => {
        if (win && !win.closed) win.location = url;
        else window.location.href = url; // popup got blocked anyway — navigate in place
    };

    if (!navigator.geolocation) {
        go(fallbackUrl);
        return;
    }

    let settled = false;
    const finish = (url) => {
        if (settled) return;
        settled = true;
        go(url);
    };

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const liveOrigin = `${pos.coords.latitude},${pos.coords.longitude}`;
            finish(buildMapsUrl(spot, liveOrigin) || fallbackUrl);
        },
        () => finish(fallbackUrl), // permission denied / position unavailable
        { timeout: 4000, maximumAge: 5 * 60 * 1000 }
    );

    // Belt-and-suspenders in case getCurrentPosition never calls back.
    setTimeout(() => finish(fallbackUrl), 5000);
}
