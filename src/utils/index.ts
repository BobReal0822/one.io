
import { ErrorMessageInfo } from './../error';

export function getRouteName(methodName: string): string {
    const reg = /[A-Z]?[a-z]+/g;
    const matches = typeof methodName === 'string' && methodName.match(reg);

    return matches && matches.reduce((prev, curr, index) => `${ index === 1 ? '/' : '' }${ prev.toLowerCase() }/${ curr.toLowerCase() }`) || '';
}

export function generateMessage(code: string, value: string): ErrorMessageInfo {
    return {
        code,
        value
    };
}
