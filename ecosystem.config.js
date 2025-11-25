// PM2 Ecosystem Configuration File
// This file defines how PM2 should manage the Blood Bank application

module.exports = {
  apps: [
    {
      name: 'bloodbank-backend',
      script: './backend/server.js',
      cwd: '/var/www/bloodbank',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // Logging
      error_file: '/var/www/bloodbank/logs/error.log',
      out_file: '/var/www/bloodbank/logs/out.log',
      log_file: '/var/www/bloodbank/logs/combined.log',
      time: true,
      
      // Auto-restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Advanced features
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Graceful shutdown
      shutdown_with_message: true
    }
  ],
  
  deploy: {
    production: {
      user: 'ubuntu',
      host: '103.230.227.5',
      port: '2022',
      ref: 'origin/main',
      repo: 'https://github.com/chankey91/BloodBankApp.git',
      path: '/var/www/bloodbank',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};

