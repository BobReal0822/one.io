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
const redis = require("redis");
const Bcrypt = require("bcryptjs");
const Client = redis.createClient();
class Permission {
    constructor(groups) {
        this.groups = new Set(groups);
    }
    getGroups() {
        return this.groups;
    }
    getValues() {
        return Array.from(this.getGroups());
    }
    static verify(permission, required) {
        let isRequired = true;
        required.getGroups().forEach(item => {
            if (!permission.getGroups().has(item)) {
                isRequired = false;
            }
        });
        return isRequired;
    }
}
exports.Permission = Permission;
class Token {
    constructor(name, token) {
        if (!name) {
            throw new Error(`name is invalid.`);
        }
        this.token = {
            name,
            value: token || Token.generateToken(name)
        };
        return this;
    }
    getToken() {
        return this.token;
    }
    static generateToken(name) {
        return Bcrypt.hashSync(`${name}${new Date().getTime()}`);
    }
    static verify(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientToken = token.getToken();
            const serverToken = yield Token.getTokenByName(clientToken.name).catch(err => {
                throw new Error(`error in Token.verify: ${err}`);
            });
            return clientToken.value === serverToken;
        });
    }
    save() {
        const { name, value } = this.token;
        Client.set(name, value);
        return value;
    }
    static getTokenByName(name) {
        return new Promise((resolve, reject) => Client.get(name, (err, value) => {
            if (err) {
                reject(err);
            }
            resolve(value);
        }));
    }
    static remove(name) {
        return Client.del(name);
    }
}
exports.Token = Token;
//# sourceMappingURL=permission.js.map