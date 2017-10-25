import { Context } from 'koa';
import * as _ from 'lodash';

import { api } from './api';

export type ResponseMethods = 'get' | 'post' | 'put' | 'head' | 'delete';

export interface ResponseInfo {
    success: boolean;
    message: string;
    code: number;
    data: {} | any[];
}

export interface ContextData {
    data: {
        [key: string]: any;
    };
}

export const DefaultResult: ResponseInfo = {
    success: true,
    message: '',
    code: 0,
    data: {}
};
