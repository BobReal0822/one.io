import { ResponseMethods } from './';
import { Permission } from './permission';
export interface ApiOptions<Permission> {
    path?: string;
    method?: ResponseMethods;
    permission?: Permission;
    token?: boolean;
    test?: boolean;
    cookies?: {
        user: string;
        token: string;
    };
}
export declare const DefaultApiOptions: {
    path: string;
    method: string;
    token: boolean;
    test: boolean;
    cookies: {
        user: string;
        token: string;
    };
};
export declare function Api<T extends Permission>(options: ApiOptions<T>, isRoute?: boolean): MethodDecorator;
export declare function route<T extends Permission>(options: ApiOptions<T>): MethodDecorator;
export declare function get<T extends Permission>(options: ApiOptions<T>): MethodDecorator;
export declare function post<T extends Permission>(options: ApiOptions<T>): MethodDecorator;
export declare function del<T extends Permission>(options: ApiOptions<T>): MethodDecorator;
export declare function put<T extends Permission>(options: ApiOptions<T>): MethodDecorator;
