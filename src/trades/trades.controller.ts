import { Request, Response } from 'express';
import * as tradesService from './trades.service.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tab = req.query.tab as 'incoming' | 'outgoing' | 'agreed' | 'all' | undefined;
    const trades = await tradesService.getTrades(userId, { tab });
    return res.json(trades);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при получении трейдов' });
  }
};

export const getCounts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const counts = await tradesService.getTradeCounts(userId);
    return res.json(counts);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка подсчета трейдов' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trade = await tradesService.getTradeById(tradeId, userId);
    return res.json(trade);
  } catch (error: any) {
    const status = error.message?.includes('доступа') ? 403 : 404;
    return res.status(status).json({ message: error.message || 'Трейд не найден' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const trade = await tradesService.createTrade(userId, req.body);
    return res.status(201).json(trade);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при создании трейда' });
  }
};

export const accept = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trade = await tradesService.acceptTrade(tradeId, userId);
    return res.json(trade);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при принятии трейда' });
  }
};

export const reject = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trade = await tradesService.rejectTrade(tradeId, userId);
    return res.json(trade);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при отклонении трейда' });
  }
};

export const cancel = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trade = await tradesService.cancelTrade(tradeId, userId);
    return res.json(trade);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при отмене трейда' });
  }
};

export const getPartners = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const partners = await tradesService.getPartners(userId);
    return res.json(partners);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при получении списка партнеров' });
  }
};

export const counter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const newTrade = await tradesService.counterTrade(tradeId, userId, req.body);
    return res.status(201).json(newTrade);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при создании встречного предложения' });
  }
};

export const complete = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trade = await tradesService.completeTrade(tradeId, userId);
    return res.json(trade);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Ошибка при завершении трейда' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const messages = await tradesService.getTradeMessages(tradeId, userId);
    return res.json(messages);
  } catch (error: any) {
    const status = error.message?.includes('доступа') ? 403 : 400;
    return res.status(status).json({ message: error.message || 'Ошибка при получении сообщений трейда' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const text = req.body.text;
    const message = await tradesService.sendTradeMessage(tradeId, userId, text);
    return res.status(201).json(message);
  } catch (error: any) {
    const status = error.message?.includes('доступа') ? 403 : 400;
    return res.status(status).json({ message: error.message || 'Ошибка при отправке сообщения' });
  }
};

