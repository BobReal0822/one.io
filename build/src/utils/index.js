"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs-extra");
const Path = require("path");
const validator_1 = require("validator");
function getRouteName(methodName) {
    const reg = /[A-Z]?[a-z]+/g;
    const matches = typeof methodName === 'string' && methodName.match(reg);
    return `/${matches && matches.reduce((prev, curr, index) => `${prev.toLowerCase()}/${curr.toLowerCase()}`) || ''}`;
}
exports.getRouteName = getRouteName;
function generateMessage(code, value) {
    return {
        code,
        value
    };
}
exports.generateMessage = generateMessage;
function formantErrorMessage(message, success, data) {
    return Object.assign({}, {
        success: !!success,
        code: message.code,
        message: message.value,
        data: data || {}
    });
}
exports.formantErrorMessage = formantErrorMessage;
function getFiles(path, reg) {
    const files = [];
    if (path && reg && Fs.statSync(path).isDirectory()) {
        Fs.readdirSync(path).map(file => {
            const filePath = Path.resolve(path, file);
            if (Fs.statSync(filePath).isFile() && reg.test(file)) {
                files.push(filePath);
            }
            else if (Fs.statSync(filePath).isDirectory()) {
                files.push(...getFiles(filePath, reg));
            }
        });
    }
    return files;
}
exports.getFiles = getFiles;
function getMethods(target) {
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
exports.getMethods = getMethods;
function filtePath(path) {
    return !path ? '' : `/${path.split('/').filter(item => !!item).join('/')}`;
}
exports.filtePath = filtePath;
function getParams(path, url) {
    const paramReg = /\:\w+/g;
    const pathMatches = path.match(paramReg) || [];
    if (!url || !path) {
        return {
            isValid: false
        };
    }
    else if (!pathMatches || !pathMatches.length && url === path) {
        return {
            isValid: true
        };
    }
    pathMatches.map(item => {
        path = path.replace(item, '(\\\w+)');
    });
    const urlMatches = new RegExp(path).exec(url) || [];
    const data = {};
    if (!urlMatches || !urlMatches.length) {
        return {
            isValid: false
        };
    }
    pathMatches.map((item, index) => {
        const key = item.replace(':', '');
        const value = urlMatches[index + 1];
        if (key && value && validator_1.isNumeric(value)) {
            data[key] = Number(value);
        }
    });
    return {
        data,
        isValid: urlMatches.length === pathMatches.length + 1 && pathMatches.length === Object.keys(data).length
    };
}
exports.getParams = getParams;
//# sourceMappingURL=index.js.map