import { NextFunction } from 'express';
import { BridgeShopRequest } from './request.js';
import { BridgeShopResponse } from './response.js';

export type SyncMiddlewareFunction<T, D> = (
  req: BridgeShopRequest,
  res: BridgeShopResponse,
  next?: NextFunction
) => T;

export type AsyncMiddlewareFunction<T, D> = (
  req: BridgeShopRequest,
  res: BridgeShopResponse,
  next?: NextFunction
) => Promise<T>;

export type ErrorMiddlewareFunction = (
  err: Error,
  req: BridgeShopRequest,
  res: BridgeShopResponse,
  next?: NextFunction
) => void;

export interface SyncMiddleware<T, D> extends Middleware {
  callback: SyncMiddlewareFunction<T, D>;
}

export interface AsyncMiddleware<T, D> extends Middleware {
  callback: AsyncMiddlewareFunction<T, D>;
}

// --------------------------------------------------------------------------

export type ENext = (error?: Error, ...args: any[]) => void;

export type MiddlewareFunction = (
  request: BridgeShopRequest,
  response: BridgeShopResponse,
  next: ENext
) => void;

export type MiddlewareFunctionWrapper = (
  request: BridgeShopRequest,
  response: BridgeShopResponse,
  next: ENext
) => void;

export type ErrorMiddlewareFunctionWrapper = (
  error: Error,
  request: BridgeShopRequest,
  response: BridgeShopResponse,
  next: ENext
) => void;

export interface Middleware {
  routeId: string;
  id: string;
  path: string;
  scope: 'app' | 'route';
  region: 'pages' | 'api';
  before?: string[];
  after?: string[];
  middleware: MiddlewareFunctionWrapper | ErrorMiddlewareFunctionWrapper;
}
