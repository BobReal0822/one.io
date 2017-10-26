import * as Fs from 'fs-extra';
import * as Path from 'path';

import { ErrorMessageInfo } from './../error';

export function getRouteName(methodName: string): string {
    const reg = /[A-Z]?[a-z]+/g;
    const matches = typeof methodName === 'string' && methodName.match(reg);

    return `/${matches && matches.reduce((prev, curr, index) => `${ prev.toLowerCase() }/${ curr.toLowerCase() }`) || ''}`;
}

export function generateMessage(code: string, value: string): ErrorMessageInfo {
    return {
        code,
        value
    };
}

export function formantErrorMessage(message: ErrorMessageInfo): string {
    return `${ message.code }: ${ message.value }`;
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

    return Object.getOwnPropertyNames(target).sort().filter((e, i, arr) => {
        if (e !== arr[i + 1] && typeof target[e] === 'function') {
            return true;
        }

        return false;
    });
}
