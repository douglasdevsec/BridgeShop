import type { BridgeShopRequest } from '../../types/request.js';

export function isAjax(request: BridgeShopRequest) {
  return request.get('X-Requested-With') === 'XMLHttpRequest';
}
