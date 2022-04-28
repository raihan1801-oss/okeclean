module.exports = {
  apps: [
    {
      name: "server",
      script: 'build/server.js ',
      exec_mode: "fork",
      watch: false,
      autorestart: false,
      cwd: ".",
      env: {},
    },
    {
      name: "client",
      script: 'views/client/build/index.js',
      exec_mode: "cluster",
      watch: false,
      autorestart: false,
      cwd: ".",
      env: {
        "HOST": "0.0.0.0",
        "PORT": "3100",
      },
    },
    {
      name: "admin",
      script: 'views/my-app/build/index.js',
      exec_mode: "cluster",
      watch: false,
      autorestart: false,
      cwd: ".",
      env: {
        "HOST": "0.0.0.0",
        "PORT": "3200",
      },
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
