// js/directions.js
//
// Free "get directions" deep links to Google Maps — NOT the paid Maps
// JavaScript/Directions API. This just builds a URL; Google Maps (app or
// web) does the geocoding/routing on the user's own device when they tap
// it, so there's no API key, no billing, and no quota to worry about.
// Docs: https://developers.google.com/maps/documentation/urls/get-started
//
// Main-gate coordinates, looked up via Google Places:
//   FTU: 91 P. Chùa Láng, Láng, Hà Nội
//   DAV: 69 P. Chùa Láng, Láng, Hà Nội
//   VYA (Học viện Thanh thiếu niên Việt Nam): 58 Đ. Nguyễn Chí Thanh, Láng, Hà Nội
// These are each school's main listed address/pin, which may sit a few
// meters from the exact gate students actually walk out of — nudge a pair
// of numbers below if you know the real gate is around a corner.
export const UNIVERSITY_GATES = {
    "FTUer Verified": "21.023033,105.805437",
    "DAVer Verified": "21.022984,105.806509",
    "VYAer Verified": "21.022332,105.809333",
};

// `spot` just needs { lat, lng, address } — works for both the normalized
// `vendor` objects in index.html and the raw Supabase rows in feed.html,
// since those share the same field names.
export function getDirectionsUrl(spot, badge) {
    const hasCoords = typeof spot.lat === "number" && typeof spot.lng === "number";
    const destination = hasCoords ? `${spot.lat},${spot.lng}` : (spot.address || "");
    if (!destination) return null;

    const params = new URLSearchParams({
        api: "1",
        destination,
        travelmode: "walking",
    });

    // Known university gate -> prefill the starting point. Unknown badge or
    // no gate on file -> leave origin out entirely, and Google Maps falls
    // back to the visitor's live GPS location, which is usually more useful
    // than a guess anyway.
    const origin = UNIVERSITY_GATES[badge];
    if (origin) params.set("origin", origin);

    return `https://www.google.com/maps/dir/?${params.toString()}`;
}
