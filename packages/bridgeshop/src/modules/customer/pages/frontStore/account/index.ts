import { translate } from '../../../../../lib/locale/translate/translate.js';
import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { BridgeShopResponse } from '../../../../../types/response.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request, response: BridgeShopResponse, next) => {
  // Check if the customer is logged in
  if (!request.isCustomerLoggedIn()) {
    // Redirect to admin dashboard
    response.redirect(buildUrl('login'));
  } else {
    setPageMetaInfo(request, {
      title: translate('My Account'),
      description: translate('My Account')
    });
    next();
  }
};
