/// <reference types="koa" />
import * as Koa from 'koa';
export declare type ResponseMethods = 'get' | 'post' | 'put' | 'head' | 'delete';
export interface ResponseInfo {
    success?: boolean;
    message?: string;
    code?: string | number;
    data: {} | any[];
}
export interface ContextData {
    data: {
        [key: string]: any;
    };
}
export declare const DefaultResult: ResponseInfo;
export interface RouterOptions {
    routePath: string;
}
export declare type NextInfo = () => Promise<any>;
export declare class Router {
    private next;
    private options;
    constructor(options?: RouterOptions);
    routes(app: Koa): any;
    private loadRoutes(app);
}
