
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
}

export const DefaultApiOptions: ApiOptions<Permission> = {
  path: '',
  method: 'get',
  tocken: '',
  test: false
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

    console.log('Permission in api: ');

    descriptor.value = (ctx: Context) => {
      const { path, method } = ctx.request;
      console.log('3 in Permission: ', (apiOptions.permission as Permission).getGroups());

      if (!apiOptions.path) {
        // error
      } else if (path === apiOptions.path && method.toLowerCase() === (apiOptions.method || '').toLowerCase()) {
        // run

        result.data = originalMethod(ctx);

        return result;
      }

      return ;
    };
  };
}
