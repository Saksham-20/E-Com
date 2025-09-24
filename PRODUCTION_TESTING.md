# Production Build Testing Guide

This guide explains how to test your production build locally before deployment.

## Quick Start (Windows)

### Option 1: Using Batch Scripts
```bash
# Build and test production build
test-prod.bat
```

### Option 2: Using NPM Scripts
```bash
# Build production frontend
npm run build:prod

# Test production build (builds and starts server)
npm run test:prod

# Or just build without starting server
npm run test:prod:build
```

## Manual Testing Steps

### 1. Build the Production Frontend
```bash
cd client
npm install
npm run build
```

### 2. Set Up Production Environment
```bash
# Copy production environment template
copy env.production.example .env

# Edit .env with your production values
# Important: Update database, JWT secret, Stripe keys, etc.
```

### 3. Start Production Server
```bash
# Set environment to production
set NODE_ENV=production

# Start the server
npm run start:prod
```

### 4. Test Your Application
- Open http://localhost:5000 in your browser
- Test all major functionality:
  - User registration/login
  - Product browsing
  - Shopping cart
  - Checkout process
  - Admin features (if applicable)

## What to Test

### Frontend Testing
- [ ] All pages load correctly
- [ ] Images and assets load properly
- [ ] Responsive design works on different screen sizes
- [ ] JavaScript functionality works (forms, modals, etc.)
- [ ] No console errors
- [ ] Performance is acceptable

### Backend Testing
- [ ] API endpoints respond correctly
- [ ] Database connections work
- [ ] File uploads work
- [ ] Authentication/authorization works
- [ ] Payment processing (if applicable)
- [ ] Email sending (if applicable)

### Integration Testing
- [ ] Frontend-backend communication works
- [ ] User flows work end-to-end
- [ ] Error handling works properly
- [ ] Security features are active

## Environment-Specific Testing

### Development vs Production Differences
- **Security**: Production has stricter CORS, CSP, and rate limiting
- **Performance**: Production build is optimized and minified
- **Error Handling**: Production hides detailed error messages
- **Logging**: Production may have different logging levels

### Database Testing
```bash
# Set up production database
npm run db:setup:prod

# Seed with test data
npm run seed
```

## Performance Testing

### Frontend Performance
- Use browser dev tools to check:
  - Page load times
  - Bundle sizes
  - Network requests
  - Memory usage

### Backend Performance
- Test API response times
- Check database query performance
- Monitor memory usage
- Test under load (if possible)

## Security Testing

### Checklist
- [ ] HTTPS is enforced (in actual production)
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Input validation works
- [ ] Authentication tokens are secure
- [ ] File uploads are restricted
- [ ] Error messages don't leak sensitive info

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check for TypeScript/JavaScript errors
   - Ensure all dependencies are installed
   - Check for missing environment variables

2. **Server Won't Start**
   - Verify database connection
   - Check environment variables
   - Ensure port is available

3. **Frontend Not Loading**
   - Check if build files exist in `client/build/`
   - Verify static file serving is configured
   - Check browser console for errors

4. **API Errors**
   - Check server logs
   - Verify database is running
   - Check environment variables

### Debug Mode
To run with more verbose logging:
```bash
set DEBUG=*
npm run start:prod
```

## Pre-Deployment Checklist

- [ ] Production build completes successfully
- [ ] All tests pass
- [ ] Environment variables are configured
- [ ] Database is set up and seeded
- [ ] Security features are active
- [ ] Performance is acceptable
- [ ] All user flows work
- [ ] Error handling works
- [ ] Logging is configured
- [ ] Backup procedures are in place

## Deployment Preparation

1. **Build Optimization**
   - Ensure build is optimized for production
   - Check bundle sizes
   - Verify all assets are included

2. **Environment Configuration**
   - Set up production environment variables
   - Configure production database
   - Set up production services (Stripe, Cloudinary, etc.)

3. **Security Review**
   - Review all security settings
   - Test authentication flows
   - Verify input validation

4. **Performance Review**
   - Test page load times
   - Check API response times
   - Monitor resource usage

## Additional Tools

### Browser Testing
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different devices (desktop, tablet, mobile)
- Use browser dev tools for performance analysis

### API Testing
- Use Postman or similar tools to test API endpoints
- Test error scenarios
- Verify response formats

### Load Testing (Optional)
- Use tools like Artillery or JMeter for load testing
- Test with realistic user loads
- Monitor performance under stress

## Notes

- Always test with production-like data
- Test error scenarios, not just happy paths
- Verify all external service integrations
- Check that all features work as expected
- Document any issues found during testing
