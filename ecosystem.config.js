module.exports = {
  apps: [{
    name: '2marchi-api',
    script: './back/dist/index.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    }
  }]
};
