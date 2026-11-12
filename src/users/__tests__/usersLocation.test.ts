import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { updateLocation, clearLocation, getProfile } from '../users.service.js';
import { MOCK_USERS, inMemoryBooks } from '../../mocks/mockBooks.js';

describe('Users Location Management in Mock Mode', () => {
  it('should update location for an existing mock user and sync in-memory books', async () => {
    const targetUserId = 'u-1';
    const originalUser = MOCK_USERS.find((u) => u.id === targetUserId);
    assert.ok(originalUser, 'User u-1 must exist in mock users');

    const newLat = 50.4501;
    const newLng = 30.5234;

    const updated = await updateLocation(targetUserId, newLat, newLng);

    assert.equal(updated.id, targetUserId);
    assert.equal(updated.latitude, newLat);
    assert.equal(updated.longitude, newLng);

    const userInArray = MOCK_USERS.find((u) => u.id === targetUserId);
    assert.equal(userInArray?.latitude, newLat);
    assert.equal(userInArray?.longitude, newLng);

    const userBooks = inMemoryBooks.filter((b) => b.userId === targetUserId);
    for (const b of userBooks) {
      if (b.user) {
        assert.equal(b.user.latitude, newLat);
        assert.equal(b.user.longitude, newLng);
      }
    }
  });

  it('should clear location for a user and sync in-memory books', async () => {
    const targetUserId = 'u-1';
    const cleared = await clearLocation(targetUserId);

    assert.equal(cleared.id, targetUserId);
    assert.equal(cleared.latitude, null);
    assert.equal(cleared.longitude, null);

    const userInArray = MOCK_USERS.find((u) => u.id === targetUserId);
    assert.equal(userInArray?.latitude, null);
    assert.equal(userInArray?.longitude, null);

    const userBooks = inMemoryBooks.filter((b) => b.userId === targetUserId);
    for (const b of userBooks) {
      if (b.user) {
        assert.equal(b.user.latitude, null);
        assert.equal(b.user.longitude, null);
      }
    }
  });

  it('should create fallback mock user if user id was from before dev restart', async () => {
    const freshUserId = 'mock-u-test99';
    const profile = await updateLocation(freshUserId, 49.8397, 24.0297);

    assert.equal(profile.id, freshUserId);
    assert.equal(profile.latitude, 49.8397);
    assert.equal(profile.longitude, 24.0297);

    const fetched = await getProfile(freshUserId);
    assert.equal(fetched.id, freshUserId);
    assert.equal(fetched.latitude, 49.8397);
    assert.equal(fetched.longitude, 24.0297);
  });
});
