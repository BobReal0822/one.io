import * as redis from 'redis';
import * as Bcrypt from 'bcryptjs';
import { Promise as bluebird } from 'bluebird';
import * as _ from 'lodash';

const Client = redis.createClient();

export abstract class Permission {
  private groups: Set<string>;

  constructor(groups: string[]) {
    this.groups = new Set(groups);
  }

  public abstract getUserPermissionByName(name: string): Promise<Permission>;

  public getGroups(): Set<string> {
    return this.groups;
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

export interface TockenInfo {
  name: string;
  value: string;
}

export class Tocken {
  private tocken: TockenInfo;

  constructor(name: string, tocken?: string) {
    if (!name) {
      // thow error
      return;
    }

    this.tocken = {
      name,
      value: tocken || Tocken.generateTocken(name)
    };

    return this;
  }

  public getTocken(): TockenInfo {
    return this.tocken;
  }

  static generateTocken<Permission>(name: string): string {
    return Bcrypt.hashSync(`${ name }${ new Date().getTime() }`);
  }

  static async verify(tocken: Tocken): Promise<boolean> {
    const clientTocken = tocken.getTocken();
    const serverTocken = await Tocken.getTockenByName(clientTocken.name).catch(err => {
      console.log('error in Tocken.verify: ', err);
    });

    console.log('clientTocken & serverTocken in verify: ', clientTocken, serverTocken);

    return clientTocken.value === serverTocken;
  }

  public save(): string {
    const { name, value } = this.tocken;

    Client.set(name, value);

    return value;
  }

  static getTockenByName(name: string): Promise<string> {
    console.log('name in getTockenByName: ', name);

    return new Promise((resolve, reject) => Client.get(name, (err, value) => {
      if (err) {
        console.log('error in getTockenByName: ', name, err);
        reject(err);
      }

      resolve(value);
    }));
  }

  // static async getAll(): Promise<any> {
  //   return new Promise((resolve, reject) => Client.keys('*', (err, keys) => {
  //     if (err) {
  //       reject(err);
  //     }

  //     const data: TockenInfo[] = keys.map(key => {
  //       name: key,
  //       value:
  //     });

  //     resolve(data);
  //   }));
  // }
}
