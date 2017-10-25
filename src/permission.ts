import * as Redis from 'redis';
import * as _ from 'lodash';

const Client = Redis.createClient();

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

  constructor(name: string, tocken: string) {
    if (!name || !tocken) {
      return;
    }

    this.tocken = {
      name,
      value: tocken
    };
  }

  public getTocken(): TockenInfo {
    return this.tocken;
  }

  static verify(client: Tocken, server: Tocken): boolean {
    const clientTocken = client.getTocken();
    const serverTocken = server.getTocken();

    return clientTocken.name === serverTocken.name && clientTocken.value === clientTocken.value;
  }

  public save() {
    const { name, value } = this.tocken;

    Client.set(name, value);
  }

  static getTockenByName(name: string) {
    return Client.get(name);
  }
}
