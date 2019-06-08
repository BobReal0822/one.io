import * as Path from 'path';
import * as Mocha from 'mocha';
import * as Chai from 'chai';

import * as Utils from './../src/utils';
import { ErrorMessage } from './../src/error';

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
      Utils.formantErrorMessage(ErrorMessage.unknown).should.deep.equal({
        success: false,
        code: ErrorMessage.unknown.code,
        message: ErrorMessage.unknown.value,
        data: {}
      });
    });
  });

  describe('getFiles', () => {
    it('should return true', () => {
      Utils.getFiles(
        Path.join(__dirname, './../../test'),
        /^[0-9a-zA-Z]+\.ts$/
      ).length.should.equal(1);
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
