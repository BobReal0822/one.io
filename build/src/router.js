"use strict";
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
    routePath: './route'
};
class Router {
    constructor(options = DefaultRouterOptions) {
        this.options = Object.assign({}, options);
    }
    routes(app) {
        try {
            return this.loadRoutes(app);
        }
        catch (err) {
            throw new Error(`in routes: ${err}`);
        }
    }
    loadRoutes(app) {
        const fileReg = /\.js$/;
        const routePath = Path.resolve(process.cwd(), this.options.routePath);
        const files = utils_1.getFiles(routePath, fileReg);
        const funcs = [];
        try {
            files.map(file => {
                const apiModule = require(file);
                const apiClass = apiModule && apiModule.default;
                const methods = apiClass && utils_1.getMethods(apiClass);
                return methods && methods.length && methods.map(method => {
                    const func = apiClass[method] && apiClass[method];
                    try {
                        if (typeof func === 'function') {
                            funcs.push(func);
                        }
                    }
                    catch (err) {
                        throw new Error(`in loadRoutes: ${err}`);
                    }
                    return;
                });
            });
            funcs.map(func => {
                app.use(func);
            });
        }
        catch (err) {
            throw new Error(`in loadRoutes: ${err}`);
        }
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map