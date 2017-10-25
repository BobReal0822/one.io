import * as _ from 'lodash';

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
