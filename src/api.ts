
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

  return (target: { [key: string]: any }, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const cookieKeys = Object.assign({}, DefaultApiOptions.cookies, options.cookies);

    descriptor.value = async (ctx: Context, next: any) => {
      await next();
      const { path, method } = ctx.request;
      const apiOptions = Object.assign({}, DefaultApiOptions, options);
      const params = getParams(apiOptions.path, path);
      let result: ResponseInfo = _.cloneDeep(DefaultResult);
      let res = {};

      apiOptions.permission = options.permission;
      apiOptions.path = options.path ? filtePath(options.path) : getRouteName(propertyKey);

      if (!params.isValid || method.toLowerCase() !== (apiOptions.method || '').toLowerCase()) {
        return;
      } else if (!apiOptions.permission) {

        try {
          (ctx as any).params = params.data;
          res = await originalMethod(ctx, next);
          ctx.body = Object.assign({}, result, res);

          return res;
        } catch (err) {
          // TODO
          console.log('err in pass: ', err);
        }

        return res;
      } else {
        const userName = ctx.cookies.get(cookieKeys.userName);
        const tocken = ctx.cookies.get(cookieKeys.tocken);

        if (!userName) {
          result = formantErrorMessage(ErrorMessage.permission.invalid);
        } else if (!tocken) {
          result = formantErrorMessage(ErrorMessage.tocken.missing);
        } else {
          const userPermission = await apiOptions.permission.getUserPermissionByName(userName);
          const isPermissionValid = Permission.verify(userPermission, apiOptions.permission);
          const isTockenValid = await Tocken.verify(new Tocken(userName, tocken));

          if (!isTockenValid) {
            result = formantErrorMessage(ErrorMessage.tocken.invalid);
          } else if (!isPermissionValid) {
            result = formantErrorMessage(ErrorMessage.permission.invalid);
          } else {
            (ctx as any).params = params.data;
            res = await originalMethod(ctx, next);
            ctx.body = Object.assign({}, result, res);

            return res;
          }
        }
      }

      ctx.body = result;

      return;
    };
  };
}

/**
 * method get
 *
 * @export
 * @template T
 * @param {ApiOptions<T>} options
 * @returns {MethodDecorator}
 */
export function get<T extends Permission>(options: ApiOptions<T>): MethodDecorator {
  return Api(Object.assign({}, options, {
    method: 'get'
  }));
}

/**
 * method post
 *
 * @export
 * @template T
 * @param {ApiOptions<T>} options
 * @returns {MethodDecorator}
 */
export function post<T extends Permission>(options: ApiOptions<T>): MethodDecorator {
  return Api(Object.assign({}, options, {
    method: 'post'
  }));
}

/**
 * method del
 *
 * @export
 * @template T
 * @param {ApiOptions<T>} options
 * @returns {MethodDecorator}
 */
export function del<T extends Permission>(options: ApiOptions<T>): MethodDecorator {
  return Api(Object.assign({}, options, {
    method: 'delete'
  }));
}

/**
 * method put
 *
 * @export
 * @template T
 * @param {ApiOptions<T>} options
 * @returns {MethodDecorator}
 */
export function put<T extends Permission>(options: ApiOptions<T>): MethodDecorator {
  return Api(Object.assign({}, options, {
    method: 'put'
  }));
}
