import { Request, Response } from 'express';
import * as tradesService from './trades.service.js';

export const getAll = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tab = req.query.tab as 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'requests' | 'all' | undefined;
  const trades = await tradesService.getTrades(userId, { tab });
  return res.json(trades);
};

export const getCounts = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const counts = await tradesService.getTradeCounts(userId);
  return res.json(counts);
};

export const getById = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const trade = await tradesService.getTradeById(tradeId, userId);
  return res.json(trade);
};

export const create = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const trade = await tradesService.createTrade(userId, req.body);
  return res.status(201).json(trade);
};

export const accept = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const trade = await tradesService.acceptTrade(tradeId, userId);
  return res.json(trade);
};

export const reject = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const trade = await tradesService.rejectTrade(tradeId, userId, req.body?.reason);
  return res.json(trade);
};

export const cancel = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const trade = await tradesService.cancelTrade(tradeId, userId);
  return res.json(trade);
};

export const getPartners = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const partners = await tradesService.getPartners(userId);
  return res.json(partners);
};

export const counter = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const newTrade = await tradesService.counterTrade(tradeId, userId, req.body);
  return res.status(201).json(newTrade);
};

export const complete = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const trade = await tradesService.completeTrade(tradeId, userId);
  return res.json(trade);
};

export const getMessages = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const messages = await tradesService.getTradeMessages(tradeId, userId);
  return res.json(messages);
};

export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const tradeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const message = await tradesService.sendTradeMessage(tradeId, userId, req.body.text);
  return res.status(201).json(message);
};
