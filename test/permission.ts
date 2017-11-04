import * as Path from 'path';
import * as Mocha from 'mocha';
import * as Chai from 'chai';

import { Permission, Tocken } from './../src';

const { assert, expect } = Chai;
const should = Chai.should();

class LocalPermission extends Permission {
  getUserPermissionByName(name: string): any {
    // null
  }
}

describe('Permission', () => {
  const permissionLiterals = ['admin', 'guest', 'none'];
  const boss = new LocalPermission(permissionLiterals);

  describe('getGroups', () => {
    it('should return true', () => {
      Array.from(boss.getGroups()).should.deep.equal(permissionLiterals);
    });
  });

  describe('getValues', () => {
    it('should return true', () => {
      boss.getValues().should.deep.equal(permissionLiterals);
    });
  });

  describe('verify', () => {
    it('should return true', () => {
      LocalPermission.verify(boss, new LocalPermission(permissionLiterals));
    });
  });
});
