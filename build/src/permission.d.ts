export declare abstract class Permission {
    private groups;
    constructor(groups: string[]);
    abstract getUserPermissionByName(name: string): Promise<Permission>;
    getGroups(): Set<string>;
    getValues(): string[];
    static verify(permission: Permission, required: Permission): boolean;
}
export interface TokenInfo {
    name: string;
    value: string;
}
export declare class Token {
    private token;
    constructor(name: string, token?: string);
    getToken(): TokenInfo;
    static generateToken<Permission>(name: string): string;
    static verify(token: Token): Promise<boolean>;
    save(): string;
    static getTokenByName(name: string): Promise<string>;
    static remove(name: string): Promise<{}>;
}
