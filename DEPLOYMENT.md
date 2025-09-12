# Deployment Guide

This guide provides comprehensive instructions for deploying the e-commerce application to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Environment Variables](#environment-variables)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling Considerations](#scaling-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 16+ installed
- MySQL 8.0+ or compatible database
- Git for version control
- Domain name (for production)
- SSL certificate (for production)
- Server/VPS with sufficient resources

### Minimum Server Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

## Database Setup

### 1. MySQL Configuration

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Database Schema

```bash
# Navigate to server directory
cd server

# Run database setup
npm run db:setup

# Seed initial data (optional)
npm run db:seed
```

## Backend Deployment

### 1. Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd ecom

# Install dependencies
cd server
npm install --production

# Create environment file
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with production values:

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=ecommerce_user
DB_PASSWORD=strong_password_here
DB_NAME=ecommerce_db
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ecommerce-api',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 4. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Frontend Deployment

### 1. Build Application

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/ecommerce`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React app)
    location / {
        root /var/www/ecommerce/client/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    location /uploads {
        alias /var/www/ecommerce/server/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Environment Variables

### Production Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com

# Database
DB_HOST=localhost
DB_USER=ecommerce_user
DB_PASSWORD=strong_password_here
DB_NAME=ecommerce_db
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CURRENCY=usd

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@your-domain.com

# File Upload
UPLOAD_PATH=/var/www/ecommerce/server/uploads
MAX_FILE_SIZE=10485760

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/ecommerce/app.log
```

## SSL/HTTPS Setup

### 1. Let's Encrypt Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. SSL Configuration

```nginx
# Add to Nginx server block
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs ecommerce-api

# Monitor metrics
pm2 show ecommerce-api
```

### 2. Log Rotation

Create `/etc/logrotate.d/ecommerce`:

```
/var/log/ecommerce/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Checks

```bash
# Create health check script
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:3000/api/health || exit 1
EOF

chmod +x /usr/local/bin/health-check.sh

# Add to crontab
# */5 * * * * /usr/local/bin/health-check.sh
```

## Scaling Considerations

### 1. Load Balancer

```nginx
# Upstream configuration
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

# In location block
location /api {
    proxy_pass http://backend;
    # ... other proxy settings
}
```

### 2. Database Scaling

```bash
# Read replicas
# Master-Slave configuration
# Connection pooling with mysql2
```

### 3. Caching

```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis
sudo nano /etc/redis/redis.conf

# Enable Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
pm2 logs ecommerce-api

# Check environment variables
pm2 env ecommerce-api

# Restart application
pm2 restart ecommerce-api
```

#### 2. Database Connection Issues

```bash
# Test database connection
mysql -u ecommerce_user -p ecommerce_db

# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### 3. Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Permission Issues

```bash
# Fix upload directory permissions
sudo chown -R www-data:www-data /var/www/ecommerce/server/uploads
sudo chmod -R 755 /var/www/ecommerce/server/uploads

# Fix log directory permissions
sudo mkdir -p /var/log/ecommerce
sudo chown -R www-data:www-data /var/log/ecommerce
```

### Performance Optimization

#### 1. Gzip Compression

```nginx
# Add to Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### 2. Browser Caching

```nginx
# Add to location blocks
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
```

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u ecommerce_user -p'password' ecommerce_db > $BACKUP_DIR/ecommerce_$DATE.sql
gzip $BACKUP_DIR/ecommerce_$DATE.sql
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
# 0 2 * * * /usr/local/bin/backup-db.sh
```

### 2. File Backup

```bash
# Backup uploads directory
tar -czf /var/backups/uploads/uploads_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/ecommerce/server/uploads

# Clean old backups
find /var/backups/uploads -name "*.tar.gz" -mtime +30 -delete
```

## Security Considerations

### 1. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js
sudo npm update -g

# Update PM2
sudo npm update -g pm2
```

### 3. Security Headers

```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Deployment Checklist

- [ ] Server prepared with required software
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Application built and deployed
- [ ] Nginx configured and enabled
- [ ] SSL certificate obtained
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security measures applied
- [ ] Performance optimization completed
- [ ] Testing completed
- [ ] Documentation updated

## Support

For deployment issues:

1. Check application logs: `pm2 logs ecommerce-api`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check MySQL logs: `sudo tail -f /var/log/mysql/error.log`
4. Verify environment variables: `pm2 env ecommerce-api`
5. Test database connection
6. Check file permissions
7. Verify firewall settings

## Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
