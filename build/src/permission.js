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
class Tocken {
    constructor(name, tocken) {
        if (!name) {
            throw new Error(`name is invalid.`);
        }
        this.tocken = {
            name,
            value: tocken || Tocken.generateTocken(name)
        };
        return this;
    }
    getTocken() {
        return this.tocken;
    }
    static generateTocken(name) {
        return Bcrypt.hashSync(`${name}${new Date().getTime()}`);
    }
    static verify(tocken) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientTocken = tocken.getTocken();
            const serverTocken = yield Tocken.getTockenByName(clientTocken.name).catch(err => {
                throw new Error(`error in Tocken.verify: ${err}`);
            });
            return clientTocken.value === serverTocken;
        });
    }
    save() {
        const { name, value } = this.tocken;
        Client.set(name, value);
        return value;
    }
    static getTockenByName(name) {
        return new Promise((resolve, reject) => Client.get(name, (err, value) => {
            if (err) {
                reject(err);
            }
            resolve(value);
        }));
    }
}
exports.Tocken = Tocken;
//# sourceMappingURL=permission.js.map