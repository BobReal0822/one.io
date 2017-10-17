
import { Context } from 'koa';
import * as _ from 'lodash';

import { DefaultResult, IResponseInfo, ResponseMethods } from './response';
import { getRouteName } from './utils';

export enum Permissions {
    none = 1,
    admin,
    normal
}

export interface IPermission {
    path?: string;
    method?: ResponseMethods;
    permission?: Permissions;
    tocken?: string;
    test?: boolean;
}

export const DefaultPermisson: IPermission = {
    path: '',
    method: 'get',
    permission: Permissions.none,
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
export function Permission(options: IPermission): MethodDecorator {
    const reg = /[A-Z]?[a-z]+/g;

    return (target: { [key: string]: any }, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        const result: IResponseInfo = _.cloneDeep(DefaultResult);
        const permission = Object.assign({}, DefaultPermisson, options, {
            path: getRouteName(propertyKey)
        });

        console.log('route name: ', permission);

        descriptor.value = (ctx: Context) => {
            const url = ctx.request.url;
            console.log('url in descriptor: ', url);

            ctx.method = options.method as string;

            if (!permission.path) {
                // error
            } else if (url === permission.path) {
                // run

                result.data = originalMethod(ctx);

                return result;
            }

            return ;
        };
    };
}
