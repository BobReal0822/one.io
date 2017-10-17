
import { Context } from 'koa';
import * as _ from 'lodash';
import * as Vali from 'validator';
import { DefaultResult, IContextData, IResponseInfo, ResponseMethods } from './response';

import { ErrorMessage, IErrorMessage } from './error';
import { getRouteName } from './utils';

export interface IValidatorOptions {
    [key: string]: RegExp | ((value: any) => boolean);
}

/**
 * validator decorator
 *
 * @export
 * @param {IValidatorOptions} [options={}]
 * @returns {MethodDecorator}
 */
export function Validator(options: IValidatorOptions = {}): MethodDecorator {
    return (target: { [key: string]: any }, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        const result: IResponseInfo = _.cloneDeep(DefaultResult);

        console.log('descriptor value: ', descriptor.value);

        descriptor.value = (ctx: (Context)) => {
            console.log('in in in \n\n\n');

            if (ctx.body && ctx.body.result && (ctx.body.result.success === false)) {
                return;
            }

            const data = ctx.query;
            const validateResult = Object.keys(options).map(key => {
                const validator = options[key];
                const value = data[key];
                let isValid = false;
                let message: IErrorMessage;

                if (typeof value !== 'boolean' && !value) {
                    message = ErrorMessage.param.missing;
                } else if (validator instanceof RegExp) {
                    isValid = validator.test(value);
                    message = ErrorMessage.param.formatError;
                } else if (typeof validator === 'function') {
                    isValid = validator(value);
                    message = ErrorMessage.param.formatError;
                } else {
                    message = ErrorMessage.param.unknown;
                }

                return {
                    isValid,
                    message,
                    key
                };
            });

            console.log('validateResult : ', validateResult);

            result.message = validateResult.map(item => item && item.isValid ? '' : `${ item.key || '' }: [${ item.message.code }], ${ item.message.value }`).join('\n');
            result.success = !result.message;
            ctx.body = result;

            return originalMethod(ctx);
        };
    };
}

