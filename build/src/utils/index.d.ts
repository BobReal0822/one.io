import { ErrorMessageInfo, ResponseInfo } from './..';
export interface GetParamsReturns {
    isValid: boolean;
    data?: {
        [key: string]: string | number;
    };
}
export declare function getRouteName(methodName: string): string;
export declare function generateMessage(code: string, value: string): ErrorMessageInfo;
export declare function formantErrorMessage(message: ErrorMessageInfo, success?: boolean, data?: any): ResponseInfo;
export declare function getFiles(path: string, reg: RegExp): string[];
export declare function getMethods(target: any): string[];
export declare function filterPath(path: string): string;
export declare function getParams(path: string, url: string): GetParamsReturns;
