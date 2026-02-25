import { PathLike } from 'fs';

export function getDistPaths(): PathLike[] {
  return ['dist', 'packages/BridgeShop/dist', 'packages/agegate/dist'];
}
