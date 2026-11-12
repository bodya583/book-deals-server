
const CITY_COORDINATES: Record<string, [number, number]> = {
  kyiv: [50.4501, 30.5234],
  lviv: [49.8397, 24.0297],
  odesa: [46.4825, 30.7233],
  odessa: [46.4825, 30.7233],
  kharkiv: [49.9935, 36.2304],
  dnipro: [48.4647, 35.0462],
  zaporizhzhia: [47.8388, 35.1396],
  warsaw: [52.2297, 21.0122],
  vinnytsia: [49.2331, 28.4682],
  'ivano-frankivsk': [48.9226, 24.7111],
  poltava: [49.5883, 34.5514],
  chernivtsi: [48.2921, 25.9358],
};

function hashToNormalizedFloat(seedStr: string, salt: number): number {
  let hash = salt;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 37 + seedStr.charCodeAt(i)) % 1000003;
  }
  return (hash % 10000) / 5000 - 1;
}

export function cloakCoordinates(
  lat: number,
  lng: number,
  bookId: string
): [number, number] {
  const latJitter = hashToNormalizedFloat(bookId, 1729) * 0.0055;
  const lngJitter = hashToNormalizedFloat(bookId, 9973) * 0.0085;

  return [Number((lat + latJitter).toFixed(5)), Number((lng + lngJitter).toFixed(5))];
}

export function disperseAndCloakCoordinates(
  lat: number,
  lng: number,
  bookId: string,
  indexInGroup: number,
  totalInGroup: number
): [number, number] {
  if (totalInGroup <= 1) {
    return cloakCoordinates(lat, lng, bookId);
  }

  const goldenAngle = 2.39996323;
  const angle = indexInGroup * goldenAngle + hashToNormalizedFloat(bookId, 42) * 0.25;

  const radiusDegLat = 0.008 + (Math.sqrt(indexInGroup + 1) - 1) * 0.0045;
  const radiusDegLng = radiusDegLat / Math.cos((lat * Math.PI) / 180);

  const dLat = Math.sin(angle) * radiusDegLat;
  const dLng = Math.cos(angle) * radiusDegLng;

  return [Number((lat + dLat).toFixed(5)), Number((lng + dLng).toFixed(5))];
}

export function resolveBookBaseCoordinates(
  owner?: { latitude?: number | null; longitude?: number | null; city?: string | null } | null
): [number, number] | null {
  if (owner?.latitude != null && owner?.longitude != null) {
    return [owner.latitude, owner.longitude];
  }

  if (owner?.city) {
    const normCity = owner.city.trim().toLowerCase();
    if (CITY_COORDINATES[normCity]) {
      return CITY_COORDINATES[normCity];
    }
  }

  return [50.4501, 30.5234];
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getDiscreteDistanceLabel(distanceKm: number | null | undefined): string {
  if (distanceKm == null || isNaN(distanceKm)) {
    return 'In your city';
  }

  if (distanceKm < 1) {
    return 'Nearby (< 1 km)';
  }
  if (distanceKm < 3.5) {
    return '~2–3 km away';
  }
  if (distanceKm < 6.5) {
    return '~5 km away';
  }
  if (distanceKm < 12) {
    return '~10 km away';
  }

  const rounded = Math.round(distanceKm / 5) * 5;
  return `~${rounded} km away`;
}
