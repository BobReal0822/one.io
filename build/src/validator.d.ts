export interface ValidatorOptions {
    [key: string]: RegExp | ((value: any) => boolean);
}
export declare function validator(options?: ValidatorOptions): MethodDecorator;
