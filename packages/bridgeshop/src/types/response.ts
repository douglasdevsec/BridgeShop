import { Response as ExpressResponse } from 'express';

export interface BridgeShopResponse extends ExpressResponse {
  debugMiddlewares: { id: string; time: number }[];
  $body: Record<string, unknown>;
}
