import * as redis from 'redis';
import * as Bcrypt from 'bcryptjs';
import { Promise as bluebird } from 'bluebird';
import * as _ from 'lodash';

const Client = redis.createClient();

/**
 * Verify user permission.
 *
 * @export
 * @abstract
 * @class Permission
 */
export abstract class Permission {
  private groups: Set<string>;

  constructor(groups: string[]) {
    this.groups = new Set(groups);
  }

  public abstract getUserPermissionByName(name: string): Promise<Permission>;

  public getGroups(): Set<string> {
    return this.groups;
  }

  public getValues(): string[] {
    return Array.from(this.getGroups());
  }

  static verify(permission: Permission, required: Permission): boolean {
    let isRequired = true;

    required.getGroups().forEach(item => {
      if (!permission.getGroups().has(item)) {
        isRequired = false;
      }
    });

    return isRequired;
  }
}

export interface TokenInfo {
  name: string;
  value: string;
}

/**
 * Verify request token.
 *
 * @export
 * @class Token
 */
export class Token {
  private token: TokenInfo;

  constructor(name: string, token?: string) {
    if (!name) {
      throw new Error(`name is invalid.`);
    }

    this.token = {
      name,
      value: token || Token.generateToken(name)
    };

    return this;
  }

  public getToken(): TokenInfo {
    return this.token;
  }

  static generateToken<Permission>(name: string): string {
    return Bcrypt.hashSync(`${name}${new Date().getTime()}`);
  }

  static async verify(token: Token): Promise<boolean> {
    const clientToken = token.getToken();
    const serverToken = await Token.getTokenByName(clientToken.name).catch(
      err => {
        throw new Error(`error in Token.verify: ${err}`);
      }
    );

    return clientToken.value === serverToken;
  }

  public save(): string {
    const { name, value } = this.token;

    Client.set(name, value);

    return value;
  }

  static getTokenByName(name: string): Promise<string> {
    return new Promise((resolve, reject) =>
      Client.get(name, (err, value) => {
        if (err) {
          reject(err);
        }

        resolve(value);
      })
    );
  }
}
