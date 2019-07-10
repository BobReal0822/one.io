import * as ContentType from 'content-type';
import { Context } from 'koa';
import * as Parse from 'co-body';
import * as formidable from 'formidable';

const ContentTypes = {
  json: 'application/json',
  form: 'application/x-www-form-urlencoded',
  raw: 'text/plain',
  formData: 'multipart/form-data'
};

export async function getQuery(ctx: Context) {
  let data: {
    [key: string]: string | number;
  } = {};

  const { params, query, body } = ctx as any;

  data = Object.assign({}, params || {}, query);

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
    case ContentTypes.formData:
      data = await new Promise(function(resolve, reject) {
        new formidable.IncomingForm().parse(ctx.req, function(
          err,
          fields,
          files
        ) {
          if (err) {
            reject(err);
          } else {
            resolve({
              ...fields,
              ...files
            });
          }
        });
      });
      break;
    default:
      data = await Parse(req);
  }

  return data;
}
