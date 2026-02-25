import bodyParser from 'body-parser';
import { BridgeShopRequest } from '../../types/request.js';
import { BridgeShopResponse } from '../../types/response.js';

export default (request: BridgeShopRequest, response: BridgeShopResponse, next) => {
  bodyParser.json()(request, response, next);
};
