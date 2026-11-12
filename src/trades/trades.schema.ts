import { z } from 'zod';

export const createTradeSchema = z.object({
  receiverId: z.string().min(1, 'Trade receiver ID is required'),
  offerBookIds: z.array(z.string()).min(1, 'At least one book must be offered'),
  targetBookIds: z.array(z.string()).min(1, 'At least one book must be requested'),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional(),
});

export const counterTradeSchema = z.object({
  receiverId: z.string().min(1, 'Counter offer receiver ID is required'),
  offerBookIds: z.array(z.string()).min(1, 'At least one book must be offered'),
  targetBookIds: z.array(z.string()).min(1, 'At least one book must be requested'),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional(),
});

export const sendTradeMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

export const rejectTradeSchema = z.object({
  reason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),
});

export const getTradesQuerySchema = z.object({
  tab: z.enum(['incoming', 'outgoing', 'agreed', 'completed', 'requests', 'all']).optional(),
});
