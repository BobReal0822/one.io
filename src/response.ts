import { Context } from 'koa';
import * as _ from 'lodash';

import { DefaultPermisson, IPermission, Permissions } from './permission';

export type ResponseMethods = 'get' | 'post' | 'put' | 'head' | 'delete';

export interface IResponseInfo {
    success: boolean;
    message: string;
    code: number;
    data: {} | any[];
}

export interface IContextData {
    data: {
        [key: string]: any;
    };
}

export const DefaultResult: IResponseInfo = {
    success: true,
    message: '',
    code: 0,
    data: {}
};
