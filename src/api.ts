
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
  const dynamicApiReg = /\:[a-zA-Z]+/;

  console.log('1 in permission.');

  return (target: { [key: string]: any }, propertyKey: string, descriptor: PropertyDescriptor) => {
    console.log('2 in permission.');
    const originalMethod = descriptor.value;
    const apiOptions = Object.assign({}, DefaultApiOptions, {
      path: getRouteName(propertyKey)
    }, options);

    apiOptions.permission = options.permission;
    const cookieKeys = Object.assign({}, DefaultApiOptions.cookies, options.cookies);

    console.log('Permission in api: ');

    descriptor.value = async (ctx: Context, next: any) => {
      const { path, method } = ctx.request;
      let result: ResponseInfo = _.cloneDeep(DefaultResult);

      await next();
      console.log('load api: ', apiOptions.path, path);
      console.log('3 in Permission: ', apiOptions.permission);
      console.log('typeof next: ', typeof next, next);

      if (path !== apiOptions.path || method.toLowerCase() !== (apiOptions.method || '').toLowerCase()) {
        return;
      } else if (!apiOptions.permission) {
        let res = {
          data: 'haha'
        };

        try {
          res = await originalMethod(ctx, next);
          // result = Object.assign({}, result, res);
          ctx.body = Object.assign({}, result, res);
          // ctx.body = {};

          console.log('pass 1 & ctx.body: ', apiOptions.path, ctx.body);

          return res;
        } catch (err) {
          console.log('err in pass: ', err);
        }

        return res;
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
          }else {
            console.log('pass 2');
            result = Object.assign({}, result, originalMethod(ctx));
            ctx.body = result;

            return;
          }
        }
      }

      console.log('resupt in api: ', result);
      ctx.body = result;

      return;
    };
  };
}
