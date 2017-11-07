/// <reference types="koa" />
import { Context } from 'koa';
export declare function getQuery(ctx: Context): Promise<{
    [key: string]: string | number;
}>;
export declare function getBody(ctx: Context): Promise<any>;
