const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
const BASE32_MAP = BASE32.split("").reduce((acc, char, index) => {
  acc[char] = index;
  return acc;
}, {});

const NEIGHBOR_DIRECTIONS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export const encodeGeohash = (latitude, longitude, precision = 7) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error("INVALID_COORDINATES");
  }

  let latRange = [-90, 90];
  let lngRange = [-180, 180];
  let geohash = "";
  let bit = 0;
  let value = 0;
  let isEvenBit = true;

  while (geohash.length < precision) {
    if (isEvenBit) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) {
        value = value * 2 + 1;
        lngRange[0] = mid;
      } else {
        value *= 2;
        lngRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        value = value * 2 + 1;
        latRange[0] = mid;
      } else {
        value *= 2;
        latRange[1] = mid;
      }
    }

    isEvenBit = !isEvenBit;
    bit += 1;

    if (bit === 5) {
      geohash += BASE32[value];
      bit = 0;
      value = 0;
    }
  }

  return geohash;
};

export const decodeGeohashBounds = (geohash) => {
  let latRange = [-90, 90];
  let lngRange = [-180, 180];
  let isEvenBit = true;

  for (const char of geohash) {
    const value = BASE32_MAP[char];
    if (value === undefined) {
      throw new Error("INVALID_GEOHASH");
    }

    for (const mask of [16, 8, 4, 2, 1]) {
      if (isEvenBit) {
        const mid = (lngRange[0] + lngRange[1]) / 2;
        if (value & mask) lngRange[0] = mid;
        else lngRange[1] = mid;
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (value & mask) latRange[0] = mid;
        else latRange[1] = mid;
      }

      isEvenBit = !isEvenBit;
    }
  }

  return { latRange, lngRange };
};

export const getGeohashCenter = (geohash) => {
  const { latRange, lngRange } = decodeGeohashBounds(geohash);

  return {
    latitude: (latRange[0] + latRange[1]) / 2,
    longitude: (lngRange[0] + lngRange[1]) / 2,
    latSize: latRange[1] - latRange[0],
    lngSize: lngRange[1] - lngRange[0],
  };
};

export const getNearbyGeohashes = (latitude, longitude, precision = 5) => {
  const centerHash = encodeGeohash(latitude, longitude, precision);
  const center = getGeohashCenter(centerHash);

  const hashes = NEIGHBOR_DIRECTIONS.map(([lngOffset, latOffset]) =>
    encodeGeohash(
      center.latitude + center.latSize * latOffset,
      center.longitude + center.lngSize * lngOffset,
      precision
    )
  );

  return [...new Set(hashes)];
};

export const getGeohashPrecisionByRadius = (radiusKm = 20) => {
  if (radiusKm <= 0.2) return 8;
  if (radiusKm <= 0.6) return 7;
  if (radiusKm <= 2.5) return 6;
  if (radiusKm <= 20) return 5;
  if (radiusKm <= 80) return 4;
  return 3;
};

export const buildGeohashPrefixRegexes = (latitude, longitude, radiusKm = 20) => {
  const precision = getGeohashPrecisionByRadius(radiusKm);
  return getNearbyGeohashes(latitude, longitude, precision).map(
    (hash) => new RegExp(`^${hash}`)
  );
};
