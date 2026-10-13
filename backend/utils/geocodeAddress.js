const geocodeAddress = async (address) => {
  const fullAddress = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country || "India",
  ]
    .filter(Boolean)
    .join(", ");

  const url = new URL("https://nominatim.openstreetmap.org/search");

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", fullAddress);
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      "User-Agent": ("Zibbite/1.0 vijaywakpanjar877@gmail.com"),
    },
  });

  if (!response.ok) {
    throw new Error("Geocoding service request failed");
  }

  const data = await response.json();

  if (!data.length) {
    throw new Error("Address not found");
  }

  return {
    type: "Point",
    coordinates: [Number(data[0].lon), Number(data[0].lat)],
  };
};


export default geocodeAddress;
