import { buildFilterFromUrl } from '../../../../../lib/util/buildFilterFromUrl.js';
import { BridgeShopRequest } from '../../../../../types/request.js';
import { setContextValue } from '../../../../graphql/services/contextHelper.js';
import { setPageMetaInfo } from '../../../services/pageMetaInfo.js';

export default (request: BridgeShopRequest, response) => {
  setPageMetaInfo(request, {
    title: 'Widgets',
    description: 'Widgets'
  });
  setContextValue(
    request,
    'filtersFromUrl',
    buildFilterFromUrl(request.originalUrl)
  );
};
