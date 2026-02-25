import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import {
  generateToken,
  generateRefreshToken,
  TOKEN_TYPES
} from '../../../../lib/util/jwt.js';
import { CurrentUser, BridgeShopRequest } from '../../../../types/request.js';
import { BridgeShopResponse } from '../../../../types/response.js';

export default async (
  request: BridgeShopRequest,
  response: BridgeShopResponse,
  next
) => {
  try {
    const message = 'Invalid email or password';
    const { body } = request;
    const { email, password } = body;
    await request.loginUserWithEmail(email, password, (error) => {
      if (error) {
        response.status(INTERNAL_SERVER_ERROR);
        response.json({
          error: {
            status: INTERNAL_SERVER_ERROR,
            message
          }
        });
        return;
      }
    });
    response.status(OK);
    const accessToken = generateToken(
      { user: request.locals.user as CurrentUser },
      TOKEN_TYPES.ADMIN
    );
    const refreshToken = generateRefreshToken(
      { user: request.locals.user as CurrentUser },
      TOKEN_TYPES.ADMIN
    );
    response.json({
      data: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    response.status(INVALID_PAYLOAD).json({
      error: {
        message: error.message,
        status: INVALID_PAYLOAD
      }
    });
  }
};
