module.exports = {
  apps: [
    {
      name: 'eta-office',
      script: 'dist-server/server/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOST: '0.0.0.0',
        DB_PATH: './data/eta-office.db',
        JWT_SECRET: '3f2b69c86eb6625f6165328a3edfbf8127e7dc6810a64cc0db1402e8398c5609',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
    },
  ],
}
