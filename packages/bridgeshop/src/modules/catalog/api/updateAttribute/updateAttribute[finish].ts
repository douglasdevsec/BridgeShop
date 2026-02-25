import { BridgeShopRequest } from '../../../../types/request.js';
import updateProductAttribute from '../../services/attribute/updateProductAttribute.js';

export default async (request: BridgeShopRequest, response) => {
  const result = await updateProductAttribute(
    Array.isArray(request.params.id) ? request.params.id[0] : request.params.id,
    request.body,
    {}
  );
  return result;
};
