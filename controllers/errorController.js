/* eslint-disable no-lonely-if */
const AppError = require('../utils/appError');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired, in again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  // console.log(req.originalUrl);
  if (req.originalUrl.startsWith('/api')) {
    console.error('Error....', err);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    // RENDERED
  }
  console.error('Error....', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    console.error('Error....', err);
    if (err.isOperational) {
      // operational: trusted error
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // programming or other unknown error
    }
    // 1) logging error
    console.error('Error....', err);

    // 2) Sending generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  // Rendered Website
  if (err.isOperational) {
    console.error('Error....', err);
    // operational: trusted error
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
    // programming or other unknown error
  }
  // 1) logging error
  console.error('Error....', err);

  // 2) Sending generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  console.log(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log('In production error');
    let error = Object.assign(err);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);

      if (error.name === 'JsonWebTokenError') {
        error = handleJWTError();
      }

      if (error.name === 'TokenExpiredError') {
        error = handleJWTExpiredError();
      }
    }
    sendErrorProd(error, req, res);
  }
};
