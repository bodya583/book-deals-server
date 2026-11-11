import { z } from 'zod';

export const createTradeSchema = z.object({
  receiverId: z.string().min(1, 'Не указан получатель предложения обмена'),
  offerBookIds: z.array(z.string()).default([]),
  targetBookIds: z.array(z.string()).default([]),
  message: z.string().max(1000, 'Сообщение не должно превышать 1000 символов').optional(),
});

export const counterTradeSchema = z.object({
  receiverId: z.string().min(1, 'Не указан получатель встречного предложения'),
  offerBookIds: z.array(z.string()),
  targetBookIds: z.array(z.string()),
  message: z.string().max(1000, 'Сообщение не должно превышать 1000 символов').optional(),
});

export const sendTradeMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Сообщение не может быть пустым')
    .max(2000, 'Сообщение не может превышать 2000 символов'),
});

export const rejectTradeSchema = z.object({
  reason: z.string().max(500, 'Причина отклонения не должна превышать 500 символов').optional(),
});

export const getTradesQuerySchema = z.object({
  tab: z.enum(['incoming', 'outgoing', 'agreed', 'completed', 'requests', 'all']).optional(),
});
