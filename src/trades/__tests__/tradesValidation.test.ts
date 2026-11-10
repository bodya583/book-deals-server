import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSelfTrade,
  validateTradePayload,
  validateBookOwnership,
  type BookOwnershipItem,
} from '../trades.validation.js';

describe('Trade Validation Rules', () => {
  describe('validateSelfTrade', () => {
    it('should throw when receiverId is missing', () => {
      assert.throws(
        () => validateSelfTrade('user-1', ''),
        /Не указан партнер по обмену/
      );
    });

    it('should throw when senderId and receiverId are identical', () => {
      assert.throws(
        () => validateSelfTrade('user-1', 'user-1'),
        /Нельзя создать предложение обмена с самим собой/
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
        /Выберите хотя бы одну книгу для предложения или запроса/
      );
    });

    it('should pass when at least one book is offered', () => {
      assert.doesNotThrow(() => validateTradePayload(['book-1'], []));
    });

    it('should pass when at least one book is requested', () => {
      assert.doesNotThrow(() => validateTradePayload([], ['book-2']));
    });
  });

  describe('validateBookOwnership', () => {
    const mockBooks: BookOwnershipItem[] = [
      { id: 'b1', userId: 'user-sender', isForTrade: true },
      { id: 'b2', userId: 'user-sender', isForTrade: true },
      { id: 'b3', userId: 'user-receiver', isForTrade: true },
      { id: 'b4', userId: 'user-receiver', isForTrade: false }, // Closed for trade!
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
        /Вы не являетесь владельцем предлагаемой книги/
      );
    });

    it('should throw if target book does not belong to receiver', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['b1'], ['b5'], mockBooks),
        /Запрашиваемая книга .* не принадлежит партнёру/
      );
    });

    it('should throw if target book is closed for trade', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['b1'], ['b4'], mockBooks),
        /закрыта владельцем для обмена/
      );
    });

    it('should throw if book does not exist in registry', () => {
      assert.throws(
        () => validateBookOwnership('user-sender', 'user-receiver', ['ghost-id'], ['b3'], mockBooks),
        /не найдена в системе/
      );
    });
  });
});
