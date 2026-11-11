import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeBooksHash, computeSimpleHash } from '../trades.validation.js';

describe('Books Hashing & Invariance Algorithm', () => {
  it('should be invariant to the order in which books are selected', () => {
    const hash1 = computeBooksHash(['b-101', 'b-102', 'b-103'], ['b-201', 'b-202']);
    const hash2 = computeBooksHash(['b-103', 'b-101', 'b-102'], ['b-202', 'b-201']);
    const hash3 = computeBooksHash(['b-102', 'b-103', 'b-101'], ['b-201', 'b-202']);

    assert.equal(hash1, hash2);
    assert.equal(hash2, hash3);
  });

  it('should distinguish between giving and receiving sides', () => {
    const hashGiveA = computeBooksHash(['book-alpha'], ['book-beta']);
    const hashGiveB = computeBooksHash(['book-beta'], ['book-alpha']);

    assert.notEqual(hashGiveA, hashGiveB);
  });

  it('should change hash when a book is added or removed', () => {
    const baseHash = computeBooksHash(['b1'], ['b2']);
    const addedHash = computeBooksHash(['b1', 'b3'], ['b2']);
    const removedHash = computeBooksHash(['b1'], []);

    assert.notEqual(baseHash, addedHash);
    assert.notEqual(baseHash, removedHash);
  });

  it('should produce consistent hash for identical empty states', () => {
    const empty1 = computeBooksHash([], []);
    const empty2 = computeBooksHash([], []);
    assert.equal(empty1, empty2);
  });

  describe('computeSimpleHash for Handover Agreements', () => {
    it('should normalize casing and trim whitespace', () => {
      const h1 = computeSimpleHash('  Shevchenko Park  ');
      const h2 = computeSimpleHash('shevchenko park');
      assert.equal(h1, h2);
    });

    it('should produce different hashes for different locations', () => {
      const h1 = computeSimpleHash('Shevchenko Park');
      const h2 = computeSimpleHash('University Metro');
      assert.notEqual(h1, h2);
    });
  });
});
