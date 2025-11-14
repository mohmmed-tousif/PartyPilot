/**
 * 404 handler and central error formatter.
 * Consistent shape: { ok:false, code, message, details? }
 */
export function notFound(_req, _res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Error';

  const payload = {
    ok: false,
    code: status,
    message
  };

  if (err.details && process.env.NODE_ENV !== 'production') {
    payload.details = err.details;
  }

  res.status(status).json(payload);
}
