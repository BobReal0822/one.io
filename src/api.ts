
import { Context } from 'koa';
import * as _ from 'lodash';
import * as Debug from 'debug';
import * as Chalk from 'chalk';

import { ErrorMessage, ErrorMessageInfo, DefaultResult, ResponseInfo, ResponseMethods, getBody } from './';
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

const log = Debug('api');

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
    const apiOptions = Object.assign({}, DefaultApiOptions, options);

    apiOptions.permission = options.permission;
    apiOptions.path = options.path ? filtePath(options.path) : getRouteName(propertyKey);
    log(`load  ${ Chalk.default.cyan(`${ apiOptions.method.toUpperCase() } ${ apiOptions.path }`) } \t ${ Chalk.default.gray(String(apiOptions.permission && apiOptions.permission.getValues() || '')) }`);

    descriptor.value = async (ctx: Context, next: any) => {
      await next();
      const { path, method } = ctx.request;

      if (method.toLowerCase() !== (apiOptions.method || '').toLowerCase()) {
        return;
      } else {
        const userName = ctx.cookies.get(cookieKeys.userName);
        const tocken = ctx.cookies.get(cookieKeys.tocken);
        const params = getParams(apiOptions.path, path);
        let result: ResponseInfo = _.cloneDeep(DefaultResult);
        let res = {};

        if (!params.isValid ) {
          return;
        } else if (!apiOptions.permission) {
          try {
            const data = await getBody(ctx);
            console.log('data in api: ', data);

            (ctx as any).params = params.data;
            (ctx.req as any).data = data;
            res = await originalMethod(ctx, next);
            ctx.body = Object.assign({}, result, res);
            log(Chalk.default.cyan(`${ apiOptions.method.toUpperCase() } ${ apiOptions.path }`));

            return res;
          } catch (err) {
            throw new Error(`Api error: ${ err }`);
          }
        } else if (!userName) {
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
            const data = await getBody(ctx);

            (ctx as any).params = params.data;
            (ctx.req as any).data = data;
            res = await originalMethod(ctx, next);
            ctx.body = Object.assign({}, result, res);
            log(`${ Chalk.default.cyan(`${ apiOptions.method.toUpperCase() } ${ apiOptions.path }`)} \t permission: ${ isPermissionValid } \t tocken: ${ isTockenValid }`);

            return res;
          }
        }

        ctx.body = result;
        log(`${ Chalk.default.cyan(`${ apiOptions.method.toUpperCase() } ${ apiOptions.path }`)} ${ result.message }`);
      }

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
