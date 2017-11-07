"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Debug = require("debug");
const Chalk = require("chalk");
const _1 = require("./");
const error_1 = require("./error");
const log = Debug('validator');
function validator(options = {}) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            const result = _.cloneDeep(_1.DefaultResult);
            const { path } = ctx.request;
            if (ctx.body && ctx.body.result && (ctx.body.result.success === false)) {
                return;
            }
            const data = ctx.req.data || {};
            const validateResult = Object.keys(options).map(key => {
                const validator = options[key];
                const value = data[key];
                let isValid = false;
                let message;
                if (typeof value !== 'boolean' && !value) {
                    message = error_1.ErrorMessage.param.missing;
                }
                else if (validator instanceof RegExp) {
                    isValid = validator.test(String(value));
                    message = error_1.ErrorMessage.param.formatError;
                }
                else if (typeof validator === 'function') {
                    isValid = validator(value);
                    message = error_1.ErrorMessage.param.formatError;
                }
                else {
                    message = error_1.ErrorMessage.param.unknown;
                }
                return {
                    isValid,
                    message,
                    key
                };
            });
            result.code = validateResult[0] && validateResult[0].message && validateResult[0].message.code || result.code;
            result.message = validateResult.map(item => item && item.isValid ? '' : `${item.key || ''}: ${item.message.value}`).filter(item => !!item).join('    ');
            result.success = !result.message;
            ctx.body = result;
            log(`${result.success ? Chalk.default.cyan('valid') : Chalk.default.red('invalid')} \t ${Chalk.default.gray(result.message)}`);
            return result.success ? originalMethod(ctx) : result;
        });
    };
}
exports.validator = validator;
//# sourceMappingURL=validator.js.map