export declare abstract class Permission {
    private groups;
    constructor(groups: string[]);
    abstract getUserPermissionByName(name: string): Promise<Permission>;
    getGroups(): Set<string>;
    getValues(): string[];
    static verify(permission: Permission, required: Permission): boolean;
}
export interface TockenInfo {
    name: string;
    value: string;
}
export declare class Tocken {
    private tocken;
    constructor(name: string, tocken?: string);
    getTocken(): TockenInfo;
    static generateTocken<Permission>(name: string): string;
    static verify(tocken: Tocken): Promise<boolean>;
    save(): string;
    static getTockenByName(name: string): Promise<string>;
}
