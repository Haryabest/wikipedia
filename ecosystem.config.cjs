/** PM2: pm2 start ecosystem.config.cjs && pm2 save */
const appDir = process.env.APP_DIR || '/var/www/wikipedia'

module.exports = {
  apps: [
    {
      name: 'efiteka',
      cwd: appDir,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 0.0.0.0',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
