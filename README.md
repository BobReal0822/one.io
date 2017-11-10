[![npm version](https://badge.fury.io/js/one.io.svg)](https://www.npmjs.com/package/one.io)
[![Build Status](https://travis-ci.org/ephoton/one.io.svg?branch=master)](https://travis-ci.org/ephoton/one.io)
[![Coverage Status](https://coveralls.io/repos/github/ephoton/one.io/badge.svg?branch=master)](https://coveralls.io/github/ephoton/one.io?branch=master)

# one.io
1️⃣ A feature-rich routing middleware for koa.

## Prerequisites
- Node.js 7+

## Install
```bash
npm install one.io --save
```
or 
```
yarn add one.io
```

## Usage
### router
Initialize your router in 'app.ts'

```typescript
// app.ts
import * as Koa from 'koa';
import { Router } from 'one.io';

const App = new Koa();
const router = new Router({
  apiPath: './build/route/api',
  routePath: './build/route/route'
});
router.routes(App);

App.listen(4000);
```

### api route
Build your routes under the directories.

```typescript
import { validator, ResponseInfo, Tocken, get, post } from 'one.io';

export default class User {
  // methods: 'get' | 'post' | 'put' | 'head' | 'delete'
  @get<UserPermission>({
    // path: 'user/register',
    permission: UserPermission.none
  })
  @validator({
    name: isAlphanumeric,
    password: isAlphanumeric
  })
  static async userRegister(ctx: Context, next: Function): Promise<ResponseInfo> {
    const { query } = ctx;
    const { name, password } = query;
    const result: ResponseInfo = await registerUser(name, password);

    return result;
  }
}
```

### page route
Render data for pages.

```typescript
import { validator, ResponseInfo, Tocken, get, post, route } from 'one.io';

export default class Index {
  @route<UserPermission>({
  })
  static async userLogin(ctx: Context, next: Function) {
    const { query } = ctx;
    const { name, password } = query;

    return {
      title: 'one.io'
    };
  }
}
```

### permission
If permission support is needed, you should import class Permission and implement it.

```typescript
import { Permission } from 'one.io';

export class UserPermission extends Permission {
    constructor(groups: string[]) {
        super(groups);
    }

    async getUserPermissionByName(name: string): Promise<UserPermission> {
      // get permission by user name
    }
}

// then build your permissions.
export const UserPermissions = {
    none: new UserPermission(['none']),
    guest: new UserPermission(['guest']),
    admin: new UserPermission(['admin'])
};
```

## Options
### router
* **apiPath**: A directory for api routes. Optional, default is './route/api'.
* **pagePath**: A directory for page routes. Optional, default is './route/page'.

### api & page
* **path**: Path for the route. Optional, automatically transform from method name.
  > For example, a method named 'userRegister' means the route path is '/user/register'
* **permission**: Set a permission for a route. Optional, default value is 'undefined'.
* **cookies**: Set the keys for user name and tocken. Optional, default is '{
  user: 'user',
  tocken: 'tocken'
}'

## Features
- Parse http request body.
- Verify Permission and tocken.
- Validate request parameters.
- Written in TypeScript with complete define types.

## License
MIT License.
