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
  routePath: string;
}

export type NextInfo = () => Promise<any>;

const DefaultRouterOptions: RouterOptions = {
  routePath: './route'
};

export class Router {
  private next: NextInfo;
  private options: RouterOptions;

  constructor(options: RouterOptions = DefaultRouterOptions) {
    this.options = Object.assign({}, options);
  }

  public routes(app: Koa): any {
      try {
        return this.loadRoutes(app);
      } catch (err) {
        throw new Error(`in routes: ${ err }`);
      }
  }

  private loadRoutes(app: Koa) {
    const fileReg = /\.js$/;
    const routePath = Path.resolve(process.cwd(), this.options.routePath);
    const files = getFiles(routePath, fileReg);
    const funcs: Middleware[] = [];

    try {
      files.map(file => {
        // tslint:disable-next-line
        const apiModule = require(file);
        const apiClass = apiModule && apiModule.default;
        const methods = apiClass && getMethods(apiClass);

        return methods && methods.length && methods.map(method => {
          const func: Middleware = apiClass[method] && apiClass[method];

          try {
            if (typeof func === 'function') {
              funcs.push(func);
            }
          } catch (err) {
            throw new Error(`in loadRoutes: ${ err }`);
          }

          return;
        });
      });

      funcs.map(func => {
        app.use(func);
      });
    } catch (err) {
      throw new Error(`in loadRoutes: ${ err }`);
    }
  }
}
