const axios = require("axios");

// Uses OpenStreetMap Nominatim (no API key) by default; can switch to Google if key provided
async function geocodeAddress(address) {
  const provider = process.env.GEOCODER || "nominatim";
  if (provider === "google" && process.env.GOOGLE_MAPS_API_KEY) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const { data } = await axios.get(url, {
      params: { address, key: process.env.GOOGLE_MAPS_API_KEY },
    });
    if (data.status !== "OK" || !data.results?.length) return null;
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }

  // Fallback to Nominatim
  const url = `https://nominatim.openstreetmap.org/search`;
  const { data } = await axios.get(url, {
    params: { q: address, format: "json", limit: 1 },
    headers: { "User-Agent": "SmartWasteManagement/1.0 (contact@example.com)" },
  });
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

module.exports = { geocodeAddress };


