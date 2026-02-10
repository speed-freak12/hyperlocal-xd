// Convert coordinates to area name using OpenStreetMap
export const getAreaFromCoordinates = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );

    const data = await res.json();
    const address = data.address || {};

    // Return main area name
    return (
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.town ||
      address.city ||
      "Unknown area"
    );
  } catch (error) {
    console.error("Location fetch failed:", error);
    return "Unknown area";
  }
};

// Get user’s current area
export const getUserArea = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const area = await getAreaFromCoordinates(lat, lon);
        resolve(area);
      },
      (error) => reject(error)
    );
  });
};
