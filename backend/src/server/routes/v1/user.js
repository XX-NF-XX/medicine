const Router = require('koa-router');
const koaBody = require('koa-body');
const services = require('../../../services');

const { ENDPOINT_PREFIX_USER } = require('../../../config');

const router = new Router({
  prefix: ENDPOINT_PREFIX_USER,
});

function getUserProfile(ctx) {
  // TODO: parse body
  return ctx.request.body;
}

async function getUser(ctx) {
  const userId = ctx.params.id;

  try {
    ctx.body = await services.getUser(userId);
  } catch (err) {
    ctx.throw(500, 'Cannot get user', { error: err });
  }
  ctx.assert(ctx.body, 404, 'User not found');
}

async function createUser(ctx) {
  // TODO: validate payload

  try {
    ctx.body = await services.createUser(getUserProfile(ctx));
  } catch (err) {
    if (err.code === '23505') {
      ctx.throw(409, 'Email already used by another account', { error: err });
    }
    ctx.throw(500, 'Cannot create user', { error: err });
  }
}

async function updateUser(ctx) {
  // TODO: validate payload

  try {
    ctx.body = await services.updateUser({
      ...getUserProfile(ctx),
      id: ctx.params.id,
    });
  } catch (err) {
    if (err.code === '23505') {
      ctx.throw(409, 'Email already used by another account', { error: err });
    }
    ctx.throw(500, 'Cannot update user', { error: err });
  }
}

router.get('/:id', getUser);
router.post('/', koaBody(), createUser);
router.post('/:id', koaBody(), updateUser);

module.exports = router;
