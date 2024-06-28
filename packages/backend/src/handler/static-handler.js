const path = require('path');

const getLandingPageHandler = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      proxy: {
        host: 'localhost',
        port: 9001,
        protocol: 'http',
        passThrough: true,
      },
    };
  }
  return {
    directory: {
      path: path.join(__dirname, '../../frontend/landing-page/dist/'),
      redirectToSlash: true,
      index: true,
    },
  };
};

module.exports = {
  getLandingPageHandler,
};
