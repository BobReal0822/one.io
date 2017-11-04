import * as ContentType from 'content-type';
import { Context } from 'koa';
import * as Parse from 'co-body';

const ContentTypes = {
  json: 'application/json',
  form: 'application/x-www-form-urlencoded',
  raw: 'text/plain'
};

export async function getQuery(ctx: Context) {
  let data: {
    [key: string]: string | number;
  } = {};

  const { params, query, body } = (ctx as any);

  data = Object.assign({}, (params || {}), query);

  return data;
}

export async function getBody(ctx: Context) {
  const { req, method } = ctx;
  let data: any;

  if (method.toLowerCase() === 'get') {
    return getQuery(ctx);
  }

  const type = ContentType.parse(req).type;

  switch (type) {
    case ContentTypes.json:
      data = await Parse.json(req);
      break;
    case ContentTypes.form:
      data = await Parse.form(req);
      break;
    case ContentTypes.raw:
      data = JSON.parse(await Parse.text(req));
      break;
    default:
      data = await Parse(req);
  }

  return data;
}
