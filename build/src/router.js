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
const Path = require("path");
const utils_1 = require("./utils");
exports.DefaultResult = {
    success: true,
    message: '',
    code: '0',
    data: {}
};
const DefaultRouterOptions = {
    apiPath: './route/api',
    routePath: './route/page'
};
class Router {
    constructor(options = DefaultRouterOptions) {
        this.options = Object.assign({}, DefaultRouterOptions, options);
    }
    routes(app) {
        try {
            return this.loadRoutes(app);
        }
        catch (err) {
            throw new Error(`in routes: ${err}`);
        }
    }
    getRouterFiles() {
        const fileReg = /\.js$/;
        const nameReg = /^(.+)\.js$/;
        const funcs = [];
        const routePath = Path.resolve(process.cwd(), this.options.routePath);
        const apiPath = Path.resolve(process.cwd(), this.options.apiPath);
        const apiFiles = utils_1.getFiles(apiPath, fileReg).map(file => ({
            file
        }));
        const routeFiles = utils_1.getFiles(routePath, fileReg).map(file => {
            const relativeName = Path.relative(this.options.routePath || '/', file);
            const matches = relativeName.match(nameReg);
            const name = matches && matches[1] || '';
            return {
                file,
                name
            };
        });
        try {
            apiFiles.concat(routeFiles).map((item) => {
                const apiModule = require(item.file);
                const apiClass = apiModule && apiModule.default;
                const methods = apiClass && utils_1.getMethods(apiClass);
                return methods && methods.length && methods.map(method => {
                    const func = apiClass[method] && apiClass[method];
                    const name = item.name;
                    try {
                        if (typeof func === 'function') {
                            funcs.push({
                                func,
                                name
                            });
                        }
                    }
                    catch (err) {
                        throw new Error(`in loadRoutes: ${err}`);
                    }
                });
            });
        }
        catch (err) {
            throw new Error(`in loadRoutes: ${err}`);
        }
        return funcs;
    }
    loadRoutes(app) {
        const fileReg = /\.js$/;
        const nameReg = /^.*\/(\w+)\.\w+$/;
        const apiPath = Path.resolve(process.cwd(), this.options.apiPath);
        const files = utils_1.getFiles(apiPath, fileReg);
        const funcs = this.getRouterFiles();
        try {
            funcs.map(item => {
                app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    return item && item.func && item.func.call(this, ctx, next, item.name);
                }));
            });
        }
        catch (err) {
            throw new Error(`in loadRoutes: ${err}`);
        }
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map