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
const permission_1 = require("./permission");
const utils_1 = require("./utils");
exports.DefaultApiOptions = {
    path: '',
    method: 'get',
    tocken: '',
    test: false,
    cookies: {
        user: 'user',
        tocken: 'tocken'
    }
};
const log = Debug('api');
function Api(options) {
    const dynamicApiReg = /\:[a-zA-Z]+/;
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        const cookieKeys = Object.assign({}, exports.DefaultApiOptions.cookies, options.cookies);
        const apiOptions = Object.assign({}, exports.DefaultApiOptions, options);
        apiOptions.permission = options.permission;
        apiOptions.path = options.path ? utils_1.filtePath(options.path) : utils_1.getRouteName(propertyKey);
        log(`load  ${Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`)} \t ${Chalk.default.gray(String(apiOptions.permission && apiOptions.permission.getValues() || ''))}`);
        descriptor.value = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            yield next();
            const { path, method } = ctx.request;
            if (method.toLowerCase() !== (apiOptions.method || '').toLowerCase()) {
                return;
            }
            else {
                const userName = ctx.cookies.get(cookieKeys.user);
                const tocken = ctx.cookies.get(cookieKeys.tocken);
                const params = utils_1.getParams(apiOptions.path, path);
                let result = _.cloneDeep(_1.DefaultResult);
                let res = {};
                if (!params.isValid) {
                    return;
                }
                else if (!apiOptions.permission) {
                    try {
                        const data = yield _1.getBody(ctx);
                        ctx.params = params.data;
                        ctx.req.data = data;
                        res = yield originalMethod(ctx, next);
                        ctx.body = Object.assign({}, result, res);
                        log(Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`));
                        return res;
                    }
                    catch (err) {
                        throw new Error(`Api error: ${err}`);
                    }
                }
                else if (!userName) {
                    result = utils_1.formantErrorMessage(_1.ErrorMessage.permission.invalid);
                }
                else if (!tocken) {
                    result = utils_1.formantErrorMessage(_1.ErrorMessage.tocken.missing);
                }
                else {
                    const userPermission = yield apiOptions.permission.getUserPermissionByName(userName);
                    const isPermissionValid = permission_1.Permission.verify(userPermission, apiOptions.permission);
                    const isTockenValid = yield permission_1.Tocken.verify(new permission_1.Tocken(userName, tocken));
                    if (!isTockenValid) {
                        result = utils_1.formantErrorMessage(_1.ErrorMessage.tocken.invalid);
                    }
                    else if (!isPermissionValid) {
                        result = utils_1.formantErrorMessage(_1.ErrorMessage.permission.invalid);
                    }
                    else {
                        const data = yield _1.getBody(ctx);
                        ctx.params = params.data;
                        ctx.req.data = data;
                        res = yield originalMethod(ctx, next);
                        ctx.body = Object.assign({}, result, res);
                        log(`${Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`)} \t permission: ${isPermissionValid} \t tocken: ${isTockenValid}`);
                        return res;
                    }
                }
                ctx.body = result;
                log(`${Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`)} ${result.message}`);
            }
            return;
        });
    };
}
exports.Api = Api;
function get(options) {
    return Api(Object.assign({}, options, {
        method: 'get'
    }));
}
exports.get = get;
function post(options) {
    return Api(Object.assign({}, options, {
        method: 'post'
    }));
}
exports.post = post;
function del(options) {
    return Api(Object.assign({}, options, {
        method: 'delete'
    }));
}
exports.del = del;
function put(options) {
    return Api(Object.assign({}, options, {
        method: 'put'
    }));
}
exports.put = put;
//# sourceMappingURL=api.js.map