import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSelfTrade,
  validateTradePayload,
  validateBookOwnership,
  assertRejectableTrade,
  type BookOwnershipItem,
} from '../trades.validation.js';

describe('Trade Validation Rules', () => {
  describe('validateSelfTrade', () => {
    it('should throw when receiverId is missing', () => {
      assert.throws(
        () => validateSelfTrade('user-1', ''),
        /Trade partner is required/
      );
    });

    it('should throw when senderId and receiverId are identical', () => {
      assert.throws(
        () => validateSelfTrade('user-1', 'user-1'),
        /Cannot create a trade offer with yourself/
      );
    });

    it('should pass when senderId and receiverId are different', () => {
      assert.doesNotThrow(() => validateSelfTrade('user-1', 'user-2'));
    });
  });

  describe('validateTradePayload', () => {
    it('should throw when both offered and target book lists are empty', () => {
      assert.throws(
        () => validateTradePayload([], []),
        /Trade requires at least one book offered and one book requested/
      );
    });

    it('should throw when offered list is empty', () => {
      assert.throws(
        () => validateTradePayload([], ['book-2']),
        /Trade requires at least one book offered and one book requested/
      );
    });

    it('should throw when target list is empty', () => {
      assert.throws(
        () => validateTradePayload(['book-1'], []),
        /Trade requires at least one book offered and one book requested/
      );
    });

    it('should pass when at least one book is offered and at least one is requested', () => {
      assert.doesNotThrow(() => validateTradePayload(['book-1'], ['book-2']));
    });
  });

  describe('validateBookOwnership', () => {
    const mockBooks: BookOwnershipItem[] = [
      { id: 'b1', userId: 'user-sender', isForTrade: true },
      { id: 'b2', userId: 'user-sender', isForTrade: true },
      { id: 'b3', userId: 'user-receiver', isForTrade: true },
      { id: 'b4', userId: 'user-receiver', isForTrade: false },
      { id: 'b5', userId: 'stranger-id', isForTrade: true },
    ];

    it('should pass when sender owns offered books and receiver owns requested books with isForTrade=true', () => {
      assert.doesNotThrow(() =>
        validateBookOwnership('user-sender', 'user-receiver', ['b1', 'b2'], ['b3'], mockBooks)
      );
    });

    it('should throw if offered book belongs to someone else', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['b5'], ['b3'], mockBooks),
        /You do not own the offered book/
      );
    });

    it('should throw if target book does not belong to receiver', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['b1'], ['b5'], mockBooks),
        /does not belong to the trade partner/
      );
    });

    it('should throw if target book is closed for trade', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['b1'], ['b4'], mockBooks),
        /is not open for trade by its owner/
      );
    });

    it('should throw if book does not exist in registry', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['ghost-id'], ['b3'], mockBooks),
        /was not found/
      );
    });
  });

  describe('assertRejectableTrade', () => {
    it('should allow recipient to reject a pending trade', () => {
      assert.doesNotThrow(() =>
        assertRejectableTrade(
          { id: 't1', senderId: 'u1', receiverId: 'u2', status: 'PENDING' },
          'u2'
        )
      );
    });

    it('should throw if sender tries to reject a pending trade', () => {
      assert.throws(
        () =>
          assertRejectableTrade(
            { id: 't1', senderId: 'u1', receiverId: 'u2', status: 'PENDING' },
            'u1'
          ),
        /Only the recipient can reject a trade/
      );
    });

    it('should allow either participant to reject an agreed trade', () => {
      assert.doesNotThrow(() =>
        assertRejectableTrade(
          { id: 't1', senderId: 'u1', receiverId: 'u2', status: 'AGREED' },
          'u1'
        )
      );
      assert.doesNotThrow(() =>
        assertRejectableTrade(
          { id: 't1', senderId: 'u1', receiverId: 'u2', status: 'AGREED' },
          'u2'
        )
      );
    });

    it('should throw if a non-participant tries to reject', () => {
      assert.throws(
        () =>
          assertRejectableTrade(
            { id: 't1', senderId: 'u1', receiverId: 'u2', status: 'AGREED' },
            'stranger'
          ),
        /You do not have permission to reject this trade/
      );
    });

    it('should throw if trade is already completed', () => {
      assert.throws(
        () =>
          assertRejectableTrade(
            { id: 't1', senderId: 'u1', receiverId: 'u2', status: 'COMPLETED' },
            'u1'
          ),
        /Cannot reject a trade with status "COMPLETED"/
      );
    });
  });
});
