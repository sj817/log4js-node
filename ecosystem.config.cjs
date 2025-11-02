/**
 * PM2 Ecosystem 配置文件
 * PM2 Ecosystem Configuration File
 * 
 * 使用方法 / Usage:
 * pm2 start ecosystem.config.cjs
 * pm2 logs
 * pm2 reload ecosystem.config.cjs
 * pm2 stop ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: 'ts-logger-app',
      script: './dist/pm2-example.js',
      instances: 4, // 或使用 'max' 来使用所有 CPU 核心 / or use 'max' to use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug'
      },
      env_production: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      },
      // PM2 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 自动重启配置
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      // 实例启动延迟
      instance_var: 'INSTANCE_ID',
      // 优雅关闭
      kill_timeout: 5000,
      listen_timeout: 3000,
      // 源映射支持
      source_map_support: true,
      // 进程 ID 文件
      pid_file: './logs/app.pid'
    }
  ],

  // 部署配置示例 / Deployment configuration example
  deploy: {
    production: {
      user: 'node',
      host: 'example.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/repo.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};
