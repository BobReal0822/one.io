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
const ContentType = require("content-type");
const Parse = require("co-body");
const formidable = require("formidable");
const ContentTypes = {
    json: 'application/json',
    form: 'application/x-www-form-urlencoded',
    raw: 'text/plain',
    formData: ' multipart/form-data'
};
function getQuery(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {};
        const { params, query, body } = ctx;
        data = Object.assign({}, params || {}, query);
        return data;
    });
}
exports.getQuery = getQuery;
function getBody(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const { req, method } = ctx;
        let data;
        if (method.toLowerCase() === 'get') {
            return getQuery(ctx);
        }
        const type = ContentType.parse(req).type;
        switch (type) {
            case ContentTypes.json:
                data = yield Parse.json(req);
                break;
            case ContentTypes.form:
                data = yield Parse.form(req);
                break;
            case ContentTypes.raw:
                data = JSON.parse(yield Parse.text(req));
                break;
            case ContentTypes.formData:
                data = yield new Promise(function (resolve, reject) {
                    new formidable.IncomingForm().parse(ctx.req, function (err, fields, files) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(Object.assign({}, fields, files));
                        }
                    });
                });
                break;
            default:
                data = yield Parse(req);
        }
        return data;
    });
}
exports.getBody = getBody;
//# sourceMappingURL=parser.js.map