function send(res, status, payload) {
  res.status(status).json(payload);
}

function ok(res, data, extra = {}) {
  send(res, 200, { success: true, ...extra, data });
}

function created(res, payload) {
  send(res, 201, { success: true, ...payload });
}

function fail(res, status, error, fields) {
  send(res, status, { success: false, error, ...(fields ? { fields } : {}) });
}

module.exports = { ok, created, fail };
