import * as Fs from 'fs-extra';
import * as Path from 'path';
import { Context } from 'koa';
import { isNumeric } from 'validator';

import { ErrorMessageInfo, ResponseMethods, ResponseInfo } from './..';

export interface GetParamsReturns {
  isValid: boolean;
  data?: {
    [key: string]: string | number;
  };
}

export function getRouteName(methodName: string): string {
  const reg = /[A-Z]?[a-z]+/g;
  const matches = typeof methodName === 'string' && methodName.match(reg);

  return `/${(matches &&
    matches.reduce(
      (prev, curr, index) => `${prev.toLowerCase()}/${curr.toLowerCase()}`
    )) ||
    ''}`;
}

export function generateMessage(code: string, value: string): ErrorMessageInfo {
  return {
    code,
    value
  };
}

export function formantErrorMessage(
  message: ErrorMessageInfo,
  success?: boolean,
  data?: any
): ResponseInfo {
  return Object.assign(
    {},
    {
      success: !!success,
      code: message.code,
      message: message.value,
      data: data || {}
    }
  );
}

export function getFiles(path: string, reg: RegExp): string[] {
  const files: string[] = [];

  if (path && reg && Fs.statSync(path).isDirectory()) {
    Fs.readdirSync(path).map(file => {
      const filePath = Path.resolve(path, file);
      if (Fs.statSync(filePath).isFile() && reg.test(file)) {
        files.push(filePath);
      } else if (Fs.statSync(filePath).isDirectory()) {
        files.push(...getFiles(filePath, reg));
      }
    });
  }

  return files;
}

export function getMethods(target: any): string[] {
  if (!target) {
    return [];
  }

  return Object.getOwnPropertyNames(target)
    .sort()
    .filter((e, i, arr) => {
      if (e !== arr[i + 1] && typeof target[e] === 'function') {
        return true;
      }

      return false;
    });
}

export function filterPath(path: string): string {
  return !path
    ? ''
    : `/${path
        .split('/')
        .filter(item => !!item)
        .join('/')}`;
}

export function getParams(path: string, url: string): GetParamsReturns {
  path = `/api${path}`;
  const paramReg = /\:\w+/g;
  const pathMatches = path.match(paramReg) || [];

  if (!url || !path) {
    return {
      isValid: false
    };
  } else if (!pathMatches || (!pathMatches.length && url === path)) {
    return {
      isValid: true
    };
  }

  pathMatches.map(item => {
    path = path.replace(item, '([A-Za-z0-9_-]+)');
  });

  const urlMatches = new RegExp(`^${path}$`).exec(url) || [];
  const data: {
    [key: string]: string | number;
  } = {};

  if (!urlMatches || !urlMatches.length) {
    return {
      isValid: false
    };
  }

  pathMatches.map((item, index) => {
    const key = item.replace(':', '');
    const value = urlMatches[index + 1];

    if (key && value) {
      data[key] = value;
    }
  });

  return {
    data,
    isValid:
      urlMatches.length === pathMatches.length + 1 &&
      pathMatches.length === Object.keys(data).length
  };
}
