
import { Context } from 'koa';
import * as _ from 'lodash';
import * as Vali from 'validator';
import { ContextData, DefaultResult, ResponseInfo, ResponseMethods } from './';

import { ErrorMessage, ErrorMessageInfo } from './error';
import { getRouteName } from './utils';

export interface ValidatorOptions {
  [key: string]: RegExp | ((value: any) => boolean);
}

/**
 * validator decorator
 *
 * @export
 * @param {ValidatorOptions} [options={}]
 * @returns {MethodDecorator}
 */
export function Validator(options: ValidatorOptions = {}): MethodDecorator {
  console.log('1 in Validator: ');

  return (target: { [key: string]: any }, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    console.log('2 in Validator: ', descriptor.value);

    descriptor.value = (ctx: Context, next: any) => {
      const result: ResponseInfo = _.cloneDeep(DefaultResult);
      const { path } = ctx.request;

      console.log('in in in \n\n\n');

      console.log('3 in Validator: ', ctx.body);

      if (ctx.body && ctx.body.result && (ctx.body.result.success === false)) {
        return;
      }

      const data = ctx.query;
      const validateResult = Object.keys(options).map(key => {
        const validator = options[key];
        const value = data[key];
        let isValid = false;
        let message: ErrorMessageInfo;

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

      result.message = validateResult.map(item => item && item.isValid ? '' : `${ item.key || '' }: [${ item.message.code }], ${ item.message.value }`).filter(item => !!item).join('    ');
      result.success = !result.message;
      ctx.body = result;

      // originalMethod(ctx);
      console.log('result in validator : ', result);

      return result.success ? originalMethod(ctx) : result;
    };
  };
}

