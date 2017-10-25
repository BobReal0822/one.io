
import { Context } from 'koa';
import * as _ from 'lodash';

import { ErrorMessage, ErrorMessageInfo, DefaultResult, ResponseInfo, ResponseMethods } from './';
import { Permission, Tocken } from './permission';
import { getRouteName, formantErrorMessage } from './utils';

export interface ApiOptions<Permission> {
  path?: string;
  method?: ResponseMethods;
  permission?: Permission;
  tocken?: string;
  test?: boolean;
  cookies?: {
    userName: string;
    tocken: string;
  };
}

export const DefaultApiOptions = {
  path: '',
  method: 'get',
  tocken: '',
  test: false,
  cookies: {
    userName: 'userName',
    tocken: 'tocken'
  }
};

/**
 * permission decorator
 *
 * @export
 * @param {IPermisson} options
 * @returns {MethodDecorator}
 */
export function Api<T extends Permission>(options: ApiOptions<T>): MethodDecorator {
  const reg = /[A-Z]?[a-z]+/g;

  console.log('1 in permission.');

  return (target: { [key: string]: any }, propertyKey: string, descriptor: PropertyDescriptor) => {
    console.log('2 in permission.');
    const originalMethod = descriptor.value;
    const result: ResponseInfo = _.cloneDeep(DefaultResult);
    const apiOptions = Object.assign({}, DefaultApiOptions, options, {
      path: getRouteName(propertyKey)
    });
    const cookieKeys = Object.assign({}, DefaultApiOptions.cookies, options.cookies);

    console.log('Permission in api: ');

    descriptor.value = async (ctx: Context) => {
      const { path, method } = ctx.request;

      console.log('3 in Permission: ', apiOptions.permission);
      // console.log('')

      if (!apiOptions.permission) {
        console.log('pass1: ', apiOptions.path);
        // result.data = originalMethod(ctx);
      } else {
        const userName = ctx.cookies.get(cookieKeys.userName);
        const tocken = ctx.cookies.get(cookieKeys.tocken);
        console.log('userName & tocken in Api: ', userName, tocken);

        if (!userName) {
          result.success = false;
          result.message = formantErrorMessage(ErrorMessage.permission.invalid);
        } else if (!tocken) {
          result.success = false;
          result.message = formantErrorMessage(ErrorMessage.tocken.missing);
        } else {
          const userPermission = await apiOptions.permission.getUserPermissionByName(userName);
          const isPermissionValid = Permission.verify(userPermission, apiOptions.permission);
          const isTockenValid = Tocken.verify(new Tocken(userName, tocken));

          if (!isTockenValid) {
            result.success = false;
            result.message = formantErrorMessage(ErrorMessage.tocken.invalid);
          } else if (!isPermissionValid) {
            result.success = false;
            result.message = formantErrorMessage(ErrorMessage.permission.invalid);
          } else if (!apiOptions.path) {
            result.success = false;
            result.message = formantErrorMessage(ErrorMessage.route.missing);
          } else if (path === apiOptions.path && method.toLowerCase() === (apiOptions.method || '').toLowerCase()) {
            console.log('pass2: ', apiOptions.path);
            // result.data = originalMethod(ctx);
          }
        }
      }

      ctx.body = result;

      return originalMethod(ctx);
    };
  };
}
