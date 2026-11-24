const fetchCoordinates = async (query) => {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Zibbite/1.0 vijaywakpanjar877@gmail.com",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return [Number(data[0].lon), Number(data[0].lat)];
    }
    return null;
  } catch (error) {
    console.error(`Geocoding error for query "${query}":`, error.message);
    return null;
  }
};

const geocodeAddress = async (address) => {
  let queries = [];

  if (typeof address === "string") {
    queries = [address];
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length > 2) {
      queries.push(parts.slice(1).join(", "));
    }
  } else if (address && typeof address === "object") {
    const full = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    const cityPostal = [
      address.postalCode,
      address.city,
      address.state,
      address.country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    const cityState = [
      address.city,
      address.state,
      address.country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    const cityCountry = [address.city, address.country || "India"]
      .filter(Boolean)
      .join(", ");

    queries = [full, cityPostal, cityState, cityCountry];
  }

  for (const q of queries) {
    if (!q) continue;
    const coords = await fetchCoordinates(q);
    if (coords) {
      return {
        type: "Point",
        coordinates: coords,
      };
    }
  }

  // Fallback default coordinates (e.g. New Delhi, India) if no results found
  return {
    type: "Point",
    coordinates: [77.209, 28.6139],
  };
};

export default geocodeAddress;
