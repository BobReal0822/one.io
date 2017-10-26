import * as Path from 'path';
import * as Koa from 'koa';
import { Context, Middleware } from 'koa';
import * as _ from 'lodash';

import { getFiles, getMethods } from './utils';

export type ResponseMethods = 'get' | 'post' | 'put' | 'head' | 'delete';

export interface ResponseInfo {
    success?: boolean;
    message?: string;
    code?: number;
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

    public routes(app: Koa): any {
        // return (ctx: Context, next: () => Promise<any>) => {
            try {
                console.log(' call loadRoutes now');

                return this.loadRoutes(app);
            } catch (err) {
                console.log('err in routes: ', err);

                return;
            }

        // };
    }

    private loadRoutes(app: Koa) {
        const fileReg = /\.js$/;
        const routePath = Path.resolve(process.cwd(), this.options.routePath);
        const files = getFiles(routePath, fileReg);
        console.log('route path in loadRoutes: ', routePath, files);

        try {
            return files.map(file => {
                // tslint:disable-next-line
                const apiModule = require(file);
                const apiClass = apiModule && apiModule.default;
                const methods = apiClass && getMethods(apiClass);

                return methods && methods.length && methods.map(method => {
                    const func: Middleware = apiClass[method] && apiClass[method];
                    // ctx.app.use(func);
                    console.log(' call func now: ');

                    try {
                        // TODO: is middleware or not?
                        app.use(func);
                    } catch (err) {
                        console.log('err in func call: ', err);
                    }

                    return;
                });
            });
        } catch (err) {
            console.log('err in loadRoutes: ', err);
        }

        return;
    }
}
