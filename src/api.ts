
import { Context } from 'koa';
import * as _ from 'lodash';

import { Permission } from './';
import { DefaultResult, ResponseInfo, ResponseMethods } from './response';
import { getRouteName } from './utils';

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
export function api<T extends Permission>(options: ApiOptions<T>): MethodDecorator {
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
      const userName = ctx.cookies.get(cookieKeys.userName);
      const tocken = ctx.cookies.get(cookieKeys.tocken);

      console.log('userName & tocken in Api: ', userName, tocken);
      // console.log('3 in Permission: ', apiOptions.permission.getGroups());
      // console.log('')

      if (!apiOptions.permission) {
        result.data = originalMethod(ctx);
      } else if (!userName) {
        result.success = false;
        // result.message =
      } else if (!tocken) {
        //
      } else {
        const userPermission = await apiOptions.permission.getUserPermissionByName(userName);
        const isValid = Permission.verify(userPermission, apiOptions.permission);

        if (!isValid) {
          //
        } else if (!apiOptions.path) {
          // error
        } else if (path === apiOptions.path && method.toLowerCase() === (apiOptions.method || '').toLowerCase()) {
          result.data = originalMethod(ctx);
        }
      }

      return result;
    };
  };
}
