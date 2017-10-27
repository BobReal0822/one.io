
import { Context } from 'koa';
import * as _ from 'lodash';

import { ErrorMessage, ErrorMessageInfo, DefaultResult, ResponseInfo, ResponseMethods } from './';
import { Permission, Tocken } from './permission';
import { getRouteName, filtePath, getParams, formantErrorMessage } from './utils';

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

    const cookieKeys = Object.assign({}, DefaultApiOptions.cookies, options.cookies);

    console.log('Permission in api: ');

    descriptor.value = async (ctx: Context, next: any) => {
      await next();
      const { path, method } = ctx.request;
      const apiOptions = Object.assign({}, DefaultApiOptions, options);
      let result: ResponseInfo = _.cloneDeep(DefaultResult);

      apiOptions.permission = options.permission;
      apiOptions.path = options.path ? filtePath(options.path) : getRouteName(propertyKey);
      const params = getParams(apiOptions.path, path);

      console.log('3 in Permission path: ', path, apiOptions.path);
      console.log('4 in Permission: ', apiOptions.permission);
      console.log('params in api: ', params);

      if (!params.isValid || method.toLowerCase() !== (apiOptions.method || '').toLowerCase()) {
        return;
      } else if (!apiOptions.permission) {
        let res = {};

        try {
          (ctx as any).params = params.data;
          res = await originalMethod(ctx, next);
          ctx.body = Object.assign({}, result, res);

          console.log('pass 1 & ctx.body: ', apiOptions.path, (ctx as any).params);

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
          result = formantErrorMessage(ErrorMessage.permission.invalid);
        } else if (!tocken) {
          result = formantErrorMessage(ErrorMessage.tocken.missing);
        } else {
          const userPermission = await apiOptions.permission.getUserPermissionByName(userName);
          const isPermissionValid = Permission.verify(userPermission, apiOptions.permission);
          const isTockenValid = await Tocken.verify(new Tocken(userName, tocken));

          console.log('isTockenValid: ', isTockenValid, tocken);
          if (!isTockenValid) {
            result = formantErrorMessage(ErrorMessage.tocken.invalid);
          } else if (!isPermissionValid) {
            result = formantErrorMessage(ErrorMessage.permission.invalid);
          } else {
            result = Object.assign({}, result, originalMethod(ctx));
            ctx.body = result;

            return;
          }
        }
      }

      ctx.body = result;

      return;
    };
  };
}
