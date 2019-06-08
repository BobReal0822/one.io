"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const Chai = require("chai");
const Utils = require("./../src/utils");
const error_1 = require("./../src/error");
const { assert, expect } = Chai;
const should = Chai.should();
describe('Utils', () => {
    describe('getRouteName', () => {
        it('should return true', () => {
            Utils.getRouteName('userRegister').should.equal('/user/register');
        });
    });
    describe('generateMessage', () => {
        it('should return true', () => {
            Utils.generateMessage('1234', 'a message').should.deep.equal({
                code: '1234',
                value: 'a message'
            });
        });
    });
    describe('formantErrorMessage', () => {
        it('should return true', () => {
            Utils.formantErrorMessage(error_1.ErrorMessage.unknown).should.deep.equal({
                success: false,
                code: error_1.ErrorMessage.unknown.code,
                message: error_1.ErrorMessage.unknown.value,
                data: {}
            });
        });
    });
    describe('getFiles', () => {
        it('should return true', () => {
            Utils.getFiles(Path.join(__dirname, './../../test'), /^[0-9a-zA-Z]+\.ts$/).length.should.equal(1);
        });
    });
    describe('filterPath', () => {
        it('should return true', () => {
            Utils.filterPath('/user/register/////').should.equal('/user/register');
        });
    });
    describe('getParams', () => {
        it('should return true', () => {
            Utils.getParams('/user/:id/', '/user/123/').should.deep.equal({
                data: {
                    id: 123
                },
                isValid: true
            });
        });
    });
});
//# sourceMappingURL=utils.js.map