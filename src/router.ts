import * as Path from 'path';
import { Context, Middleware } from 'koa';
import * as _ from 'lodash';

import { getFiles, getMethods } from './utils';

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

export interface RouterOptions {
    routePath: string;
}

export type NextInfo = () => Promise<any>;

const DefaultRouterOptions: RouterOptions = {
    routePath: './route'
};

export class Router {
    private next: NextInfo;
    private options: RouterOptions;

    constructor(options: RouterOptions = DefaultRouterOptions) {
        this.options = Object.assign({}, options);
    }

    public routes(): any {
        return async (ctx: Context, next: () => Promise<any>) => {
            this.loadRoutes(ctx);
            next();
        };
    }

    private loadRoutes(ctx: Context) {
        const fileReg = /\.js$/;
        const routePath = Path.resolve(process.cwd(), this.options.routePath);
        const files = getFiles(routePath, fileReg);
        // console.log('route path in loadRoutes: ', routePath, files);

        files.map(file => {
            // tslint:disable-next-line
            const apiModule = require(file);
            const api = apiModule.default;
            const methods = getMethods(api);

            methods.map(method => {
                api[method](ctx);
            });
        });
    }
}
