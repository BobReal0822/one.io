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
    token: false,
    test: false,
    cookies: {
        user: 'user',
        token: 'token'
    }
};
const log = Debug('api');
function Api(options, isRoute) {
    const dynamicApiReg = /\:[a-zA-Z]+/;
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        const cookieKeys = Object.assign({}, exports.DefaultApiOptions.cookies, options.cookies);
        const apiOptions = Object.assign({}, exports.DefaultApiOptions, options);
        apiOptions.permission = options.permission;
        apiOptions.path = options.path
            ? utils_1.filterPath(options.path)
            : utils_1.getRouteName(propertyKey);
        log(`load  ${Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`)} \t ${Chalk.default.gray(String((apiOptions.permission && apiOptions.permission.getValues()) || ''))}`);
        descriptor.value = (ctx, next, route) => __awaiter(this, void 0, void 0, function* () {
            yield next();
            const { path, method } = ctx.request;
            if (method.toLowerCase() !== (apiOptions.method || '').toLowerCase()) {
                return;
            }
            else {
                const userName = ctx.cookies.get(cookieKeys.user);
                const token = apiOptions.token ? ctx.cookies.get(cookieKeys.token) : '';
                const params = utils_1.getParams(apiOptions.path, path);
                let result = _.cloneDeep(_1.DefaultResult);
                let res = {};
                if (!params.isValid &&
                    !(isRoute &&
                        (path === `/${route}` || (path === '/' && route === 'index')))) {
                    return;
                }
                else if (!apiOptions.permission) {
                    try {
                        const data = yield _1.getBody(ctx);
                        ctx.params = params.data;
                        ctx.req.data = data;
                        res = yield originalMethod(ctx, next);
                        log(Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`));
                        if (isRoute) {
                            return ctx.render(route, res);
                        }
                        else {
                            ctx.body = Object.assign({}, result, res);
                            return res;
                        }
                    }
                    catch (err) {
                        throw new Error(`Api error: ${err}`);
                    }
                }
                else if (!userName) {
                    result = utils_1.formantErrorMessage(_1.ErrorMessage.permission.invalid);
                }
                else if (apiOptions.token && !token) {
                    result = utils_1.formantErrorMessage(_1.ErrorMessage.token.missing);
                }
                else {
                    const userPermission = yield apiOptions.permission.getUserPermissionByName(userName);
                    const isPermissionValid = permission_1.Permission.verify(userPermission, apiOptions.permission);
                    const isTokenValid = apiOptions.token
                        ? yield permission_1.Token.verify(new permission_1.Token(userName, token))
                        : true;
                    if (!isTokenValid) {
                        result = utils_1.formantErrorMessage(_1.ErrorMessage.token.invalid);
                    }
                    else if (!isPermissionValid) {
                        result = utils_1.formantErrorMessage(_1.ErrorMessage.permission.invalid);
                    }
                    else {
                        const data = yield _1.getBody(ctx);
                        ctx.params = params.data;
                        ctx.req.data = data;
                        res = yield originalMethod(ctx, next);
                        log(`${Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`)} \t permission: ${isPermissionValid} \t token: ${isTokenValid}`);
                        if (isRoute) {
                            return ctx.render(route, res);
                        }
                        else {
                            ctx.body = Object.assign({}, result, res);
                            return res;
                        }
                    }
                }
                log(`${Chalk.default.cyan(`${apiOptions.method.toUpperCase()} ${apiOptions.path}`)} ${result.message}`);
                if (!isRoute) {
                    ctx.body = result;
                }
            }
            return;
        });
    };
}
exports.Api = Api;
function route(options) {
    return Api(Object.assign({}, options, {
        method: 'get'
    }), true);
}
exports.route = route;
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