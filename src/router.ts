import * as Path from 'path';
import * as Koa from 'koa';
import { Context, Middleware } from 'koa';
import * as _ from 'lodash';

import { getFiles, getMethods } from './utils';

export type ResponseMethods = 'get' | 'post' | 'put' | 'head' | 'delete';

export interface ResponseInfo {
  success?: boolean;
  message?: string;
  code?: string | number;
  data: {} | any[];
}

export interface ContextData {
  data: {
    [key: string]: any;
  };
}

export const DefaultResult: ResponseInfo = {
  success: true,
  message: '',
  code: '0',
  data: {}
};

export interface RouterOptions {
  apiPath?: string;
  routePath?: string;
}

export type NextInfo = () => Promise<any>;

const DefaultRouterOptions: RouterOptions = {
  apiPath: './route/api',
  routePath: './route/page'
};

/**
 * load routes
 *
 * @export
 * @class Router
 */
export class Router {
  private next: NextInfo;
  private options: RouterOptions;

  constructor(options: RouterOptions = DefaultRouterOptions) {
    this.options = Object.assign({}, DefaultRouterOptions, options);
  }

  public routes(app: Koa): any {
    try {
      return this.loadRoutes(app);
    } catch (err) {
      throw new Error(`in routes: ${err}`);
    }
  }

  private getRouterFiles() {
    const fileReg = /\.js$/;
    const nameReg = /^(.+)\.js$/;
    const funcs: {
      func: Middleware;
      name?: string;
    }[] = [];
    const routePath = Path.resolve(process.cwd(), this.options.routePath || '');
    const apiPath = Path.resolve(process.cwd(), this.options.apiPath || '');
    const apiFiles = getFiles(apiPath, fileReg).map(file => ({
      file
    }));
    const routeFiles = getFiles(routePath, fileReg).map(file => {
      const relativeName = Path.relative(this.options.routePath || '/', file);
      const matches = relativeName.match(nameReg);
      const name = (matches && matches[1]) || '';

      return {
        file,
        name
      };
    });

    try {
      apiFiles
        .concat(routeFiles)
        .map((item: { file: string; name?: string }) => {
          // tslint:disable-next-line
          const apiModule = require(item.file);
          const apiClass = apiModule && apiModule.default;
          const methods = apiClass && getMethods(apiClass);

          return (
            methods &&
            methods.length &&
            methods.map(method => {
              const func: Middleware = apiClass[method] && apiClass[method];
              const name = item.name;

              try {
                if (typeof func === 'function') {
                  funcs.push({
                    func,
                    name
                  });
                }
              } catch (err) {
                throw new Error(`in loadRoutes: ${err}`);
              }
            })
          );
        });
    } catch (err) {
      throw new Error(`in loadRoutes: ${err}`);
    }

    return funcs;
  }

  private loadRoutes(app: Koa) {
    const fileReg = /\.js$/;
    const nameReg = /^.*\/(\w+)\.\w+$/;
    const apiPath = Path.resolve(process.cwd(), this.options.apiPath || '');
    const files = getFiles(apiPath, fileReg);
    const funcs = this.getRouterFiles();

    try {
      funcs.map(item => {
        app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
          return (
            item && item.func && item.func.call(this, ctx, next, item.name)
          );
        });
      });
    } catch (err) {
      throw new Error(`in loadRoutes: ${err}`);
    }
  }
}
