import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  cloakCoordinates,
  disperseAndCloakCoordinates,
  getDiscreteDistanceLabel,
  resolveBookBaseCoordinates,
} from '../../utils/geoPrivacy.js';

describe('Geo Privacy & Spatial Cloaking Algorithms', () => {
  describe('calculateDistanceKm (Haversine formula)', () => {
    it('should calculate accurate Great-Circle distance between Kyiv and Odesa (~440-450 km)', () => {
      const distance = calculateDistanceKm(50.4501, 30.5234, 46.4825, 30.7233);
      assert.ok(distance > 440 && distance < 450, `Expected distance ~442km, got ${distance}`);
    });

    it('should return 0 for identical points', () => {
      const distance = calculateDistanceKm(50.4501, 30.5234, 50.4501, 30.5234);
      assert.equal(distance, 0);
    });
  });

  describe('cloakCoordinates', () => {
    it('should obfuscate exact coordinates deterministically for a given bookId', () => {
      const lat = 50.4501;
      const lng = 30.5234;
      const [cloakedLat1, cloakedLng1] = cloakCoordinates(lat, lng, 'book-123');
      const [cloakedLat2, cloakedLng2] = cloakCoordinates(lat, lng, 'book-123');

      assert.equal(cloakedLat1, cloakedLat2);
      assert.equal(cloakedLng1, cloakedLng2);

      assert.notEqual(cloakedLat1, lat);
      assert.notEqual(cloakedLng1, lng);

      const offsetKm = calculateDistanceKm(lat, lng, cloakedLat1, cloakedLng1);
      assert.ok(offsetKm > 0 && offsetKm < 1.5, `Offset should be bounded, got ${offsetKm} km`);
    });
  });

  describe('disperseAndCloakCoordinates', () => {
    it('should disperse co-located books so they do not overlap on the map', () => {
      const baseLat = 50.4501;
      const baseLng = 30.5234;

      const p1 = disperseAndCloakCoordinates(baseLat, baseLng, 'book-a', 0, 3);
      const p2 = disperseAndCloakCoordinates(baseLat, baseLng, 'book-b', 1, 3);
      const p3 = disperseAndCloakCoordinates(baseLat, baseLng, 'book-c', 2, 3);

      assert.notDeepEqual(p1, p2);
      assert.notDeepEqual(p2, p3);
      assert.notDeepEqual(p1, p3);
    });
  });

  describe('getDiscreteDistanceLabel (Differential Privacy against Trilateration)', () => {
    it('should return safe ranges instead of raw meters', () => {
      assert.equal(getDiscreteDistanceLabel(0.4), 'Nearby (< 1 km)');
      assert.equal(getDiscreteDistanceLabel(2.5), '~2–3 km away');
      assert.equal(getDiscreteDistanceLabel(5.2), '~5 km away');
      assert.equal(getDiscreteDistanceLabel(10.1), '~10 km away');
      assert.equal(getDiscreteDistanceLabel(23.4), '~25 km away');
    });

    it('should handle undefined or null distance safely', () => {
      assert.equal(getDiscreteDistanceLabel(null), 'In your city');
      assert.equal(getDiscreteDistanceLabel(undefined), 'In your city');
    });
  });

  describe('resolveBookBaseCoordinates', () => {
    it('should resolve coordinates from user city when exact GPS is null', () => {
      const coords = resolveBookBaseCoordinates({ city: 'Odesa' });
      assert.deepEqual(coords, [46.4825, 30.7233]);
    });

    it('should prioritize exact GPS coordinates if present', () => {
      const coords = resolveBookBaseCoordinates({
        city: 'Odesa',
        latitude: 50.0,
        longitude: 36.0,
      });
      assert.deepEqual(coords, [50.0, 36.0]);
    });
  });
});
