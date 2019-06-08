import { Context } from 'koa';
import * as _ from 'lodash';
import * as Debug from 'debug';
import * as Chalk from 'chalk';

import {
  ContextData,
  DefaultResult,
  ResponseInfo,
  ResponseMethods,
  getBody
} from './';
import { ErrorMessage, ErrorMessageInfo } from './error';
import { getRouteName } from './utils';

export interface ValidatorOptions {
  [key: string]: RegExp | ((value: any) => boolean);
}

const log = Debug('validator');

/**
 * validator decorator
 *
 * @export
 * @param {ValidatorOptions} [options={}]
 * @returns {MethodDecorator}
 */
export function validator(options: ValidatorOptions = {}): MethodDecorator {
  return (
    target: { [key: string]: any },
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async (ctx: Context, next: any) => {
      const result: ResponseInfo = _.cloneDeep(DefaultResult);
      const { path } = ctx.request;

      if (ctx.body && ctx.body.result && ctx.body.result.success === false) {
        return;
      }

      const data = (ctx.req as any).data || {};

      const validateResult = Object.keys(options).map(key => {
        const validator = options[key];
        const value = data[key];
        let isValid = false;
        let message: ErrorMessageInfo;

        if (typeof value !== 'boolean' && !value) {
          message = ErrorMessage.param.missing;
        } else if (validator instanceof RegExp) {
          isValid = validator.test(String(value));
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

      result.code =
        (validateResult[0] &&
          validateResult[0].message &&
          validateResult[0].message.code) ||
        result.code;
      result.message = validateResult
        .map(item =>
          item && item.isValid ? '' : `${item.key || ''}: ${item.message.value}`
        )
        .filter(item => !!item)
        .join('    ');
      result.success = !result.message;
      ctx.body = result;
      log(
        `${
          result.success
            ? Chalk.default.cyan('valid')
            : Chalk.default.red('invalid')
        } \t ${Chalk.default.gray(result.message)}`
      );

      return result.success ? originalMethod(ctx) : result;
    };
  };
}
