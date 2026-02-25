import { buildFilterFromUrl } from '../../../../../lib/util/buildFilterFromUrl.js';
import { BridgeShopRequest } from '../../../../../types/request.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';
import { setContextValue } from '../../../../graphql/services/contextHelper.js';

export default (request: BridgeShopRequest, response) => {
  setPageMetaInfo(request, {
    title: 'Customers',
    description: 'Customers'
  });
  setContextValue(
    request,
    'filtersFromUrl',
    buildFilterFromUrl(request.originalUrl)
  );
};
