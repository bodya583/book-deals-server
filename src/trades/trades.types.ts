export interface CreateTradeDto {
  receiverId: string;
  offerBookIds: string[];
  targetBookIds: string[];
  message?: string;
}

export type TradeTab = 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'requests' | 'all';

export interface TradeFilter {
  tab?: TradeTab;
}
