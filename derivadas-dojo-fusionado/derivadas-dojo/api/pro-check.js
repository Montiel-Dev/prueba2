/* GET /api/pro-check  (header x-pro-token) -> { ok, pro, exp } */
const { send } = require("../lib/ai");
const { verify } = require("../lib/pro");
module.exports = (req, res) => {
  const p = verify(req.headers["x-pro-token"]);
  send(res, 200, { ok: true, pro: !!p, exp: p ? p.exp : null });
};
