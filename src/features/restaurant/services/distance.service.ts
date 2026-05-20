const openRouteServiceApiKey =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUzMjI0MjRhZWJkNzQyMmE5OGFhMWQ2NGVhMmE2ZjNkIiwiaCI6Im11cm11cjY0In0=";
const distanceCacheKey = "food-map.route-distances";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteDistance = {
  distanceKm: number;
  durationMinutes: number;
};

function normalizeCoordinate(value: number) {
  return value.toFixed(5);
}

export function buildDistanceCacheKey(
  restaurantId: string,
  origin: Coordinate,
  destination: Coordinate,
) {
  return [
    restaurantId,
    normalizeCoordinate(origin.latitude),
    normalizeCoordinate(origin.longitude),
    normalizeCoordinate(destination.latitude),
    normalizeCoordinate(destination.longitude),
  ].join("|");
}

function readDistanceCache() {
  const rawValue = sessionStorage.getItem(distanceCacheKey);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as Record<string, RouteDistance>;
  } catch {
    sessionStorage.removeItem(distanceCacheKey);

    return {};
  }
}

export function getCachedDistance(cacheKey: string) {
  return readDistanceCache()[cacheKey] ?? null;
}

export function saveCachedDistance(cacheKey: string, distance: RouteDistance) {
  sessionStorage.setItem(
    distanceCacheKey,
    JSON.stringify({
      ...readDistanceCache(),
      [cacheKey]: distance,
    }),
  );
}

export function clearDistanceCache() {
  sessionStorage.removeItem(distanceCacheKey);
}

export async function getDrivingDistance(
  origin: Coordinate,
  destination: Coordinate,
): Promise<RouteDistance> {
  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      method: "POST",
      headers: {
        Authorization: openRouteServiceApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude],
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tính khoảng cách.");
  }

  const data = await response.json();
  const summary = data?.routes?.[0]?.summary;

  if (!summary) {
    throw new Error("Dữ liệu khoảng cách không hợp lệ.");
  }

  return {
    distanceKm: Number(summary.distance ?? 0) / 1000,
    durationMinutes: Number(summary.duration ?? 0) / 60,
  };
}
