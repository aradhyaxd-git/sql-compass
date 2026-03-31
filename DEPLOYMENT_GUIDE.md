# Open Source & Deployment Guide

## Table of Contents
1. [Pre-Release Checklist](#pre-release-checklist)
2. [Deployment Strategies](#deployment-strategies)
3. [Repository Setup](#repository-setup)
4. [Production Readiness](#production-readiness)
5. [Security Checklist](#security-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Release Checklist

### Code Quality
- [ ] **ESLint**: No warnings or errors
  ```bash
  npm run lint
  ```
- [ ] **TypeScript**: Zero compilation errors
  ```bash
  npm run build
  ```
- [ ] **Prettier**: Code formatted consistently
  ```bash
  npm run format
  ```
- [ ] **Remove debug code**: No `console.log()` or test statements
  - Search for: `console.`, `TODO:`, `FIXME:`, test variables
- [ ] **Remove API keys**: Search entire codebase
  ```bash
  grep -r "sk_test_\|pk_test_\|AIzaSy" --include="*.ts" --include="*.tsx"
  ```

### Environment Configuration
- [ ] **Create `.env.example`** files (no real values)
  ```bash
  # Backend
  PORT=5000
  NODE_ENV=production
  CLERK_SECRET_KEY=sk_test_...
  MONGODB_URI=mongodb+srv://...
  POSTGRES_URL=postgresql://...
  GOOGLE_API_KEY=AIzaSy...
  ```

- [ ] **Verify `.gitignore`**:
  ```
  node_modules/
  .env
  .env.local
  dist/
  build/
  .DS_Store
  *.log
  ```

### Documentation
- [ ] **README.md**: Clear project description
- [ ] **SETUP.md** or **INSTALLATION.md**: Step-by-step guide
- [ ] **ARCHITECTURE.md** or **CONTRIBUTING.md**: Dev guide
- [ ] **API.md**: Endpoint documentation
- [ ] **LICENSE**: MIT or Apache 2.0
- [ ] **CHANGELOG.md**: Version history
- [ ] **CODE_OF_CONDUCT.md**: Community guidelines

### Testing
- [ ] **Manual testing**: All features work
- [ ] **Error scenarios**: Test 404, 500, rate limits
- [ ] **Authentication**: Verify login/logout
- [ ] **Database**: Test with empty/full datasets
- [ ] **Cross-browser**: Chrome, Firefox, Safari

### Dependencies
- [ ] **Audit for vulnerabilities**:
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] **Update outdated packages**:
  ```bash
  npm outdated
  npm update
  ```
- [ ] **Check license compliance**: Ensure compatible licenses

---

## Deployment Strategies

### Option 1: Railway.app (Recommended for Simple Setup)

#### Why Railway?
- Free tier with $5/month credit
- Automatic deployments from GitHub
- Built-in database support (MongoDB, PostgreSQL)
- Environment management
- Minimal DevOps knowledge needed

#### Steps:

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Connect GitHub Repository**
   - Create new project
   - Select "Deploy from GitHub repo"
   - Authorize and select your repo

3. **Configure Backend Service**
   ```bash
   # Railway automatically detects Node.js
   # Set build command:
   npm install && npm run build
   
   # Set start command:
   npm run start
   ```

4. **Add Environment Variables**
   - In Railway dashboard: Settings → Variables
   - Add all `.env` variables (get from `.env.example`)

5. **Database Setup**
   - MongoDB Atlas (free tier)
   - Neon PostgreSQL (Railway partner)
   - Copy connection strings to Railway variables

6. **Deploy**
   - Click "Deploy"
   - Railway automatically deploys on git push

#### Costs:
- Backend: ~$5-10/month
- Databases: Free (MongoDB Atlas, Neon)
- **Total**: $5-10/month

---

### Option 2: Vercel + Express Server

#### Why Vercel for Frontend?
- Optimized for React/Next.js
- Extremely fast (CDN)
- Free tier sufficient
- Automatic HTTPS

#### Steps:

1. **Deploy Frontend**
   ```bash
   npm i -g vercel
   vercel
   ```
   - Select framework: Vite
   - Deploy to Vercel

2. **Update API URL in Frontend**
   ```typescript
   // client/services/api.ts
   const API_URL = process.env.VITE_API_URL || 'https://your-api.railway.app';
   ```

3. **Set Production Environment**
   - Vercel dashboard → Settings → Environment Variables
   - Add `VITE_API_URL=https://api.railwayapp.com`

---

### Option 3: AWS Deployment (For Scale)

#### Architecture:
```
CloudFront (CDN)
    ↓
S3 (Frontend)
    ↓
ELB (Load Balancer)
    ↓
ECS (Express Backend)
    ↓
RDS (PostgreSQL) + DocumentDB (MongoDB)
```

#### Cost Estimate: $50-100/month at scale

#### Steps:

1. **Frontend: S3 + CloudFront**
   ```bash
   # Build frontend
   cd client && npm run build
   
   # Upload to S3
   aws s3 sync dist/ s3://your-bucket-name/
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

2. **Backend: ECS**
   - Create Docker image
   - Push to ECR
   - Deploy to ECS Fargate

3. **Databases: RDS + DocumentDB**
   - Use managed services for reliability
   - Enable backups
   - Multi-AZ for availability

---

### Option 4: Docker + Docker Compose (Local)

#### Create Dockerfile for Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/sql-compass
      - POSTGRES_URL=postgresql://postgres:password@postgres:5432/sql
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - mongodb
      - postgres
    networks:
      - app-network

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=sql
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  frontend:
    build: ./client
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://backend:5000
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

#### Run:
```bash
docker-compose up -d
```

---

## Repository Setup

### GitHub Repository Structure

```
sql-compass/
├── backend/
├── client/
├── docs/                    # Additional documentation
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml          # Run tests on PR
│       └── deploy.yml      # Auto-deploy on merge
├── README.md               # Project overview
├── SETUP.md               # Installation guide
├── CONTRIBUTING.md        # Contribution guidelines
├── CODE_OF_CONDUCT.md     # Community rules
├── LICENSE                # MIT/Apache 2.0
├── CHANGELOG.md           # Version history
└── .gitignore             # Exclude files
```

### GitHub Actions CI/CD

#### ci.yml - Run Tests on Pull Requests

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Backend Dependencies
        run: cd backend && npm install

      - name: Lint Backend
        run: cd backend && npm run lint

      - name: Build Backend
        run: cd backend && npm run build

      - name: Install Frontend Dependencies
        run: cd client && npm install

      - name: Build Frontend
        run: cd client && npm run build

      - name: Test
        run: npm run test
```

#### deploy.yml - Auto-Deploy on Merge

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway deploy
```

### README.md Template

```markdown
# SQL Compass

[![CI](https://github.com/yourusername/sql-compass/actions/workflows/ci.yml/badge.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](...)

> A full-stack SQL learning platform with AI-powered hints

## Features

- 📚 31 SQL practice assignments
- 💡 AI-powered hints (Google Gemini)
- ✈️ Flight logs with attempt history
- 🎯 XP system for gamification
- 🔐 Secure authentication (Clerk)

## Tech Stack

**Frontend**: React 19 + TypeScript + Vite
**Backend**: Express.js + TypeScript
**Databases**: PostgreSQL + MongoDB
**AI**: Google Generative AI

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL (Neon)
- MongoDB (Atlas)

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/sql-compass.git
   cd sql-compass
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Frontend setup**
   ```bash
   cd client
   npm install
   cp .env.example .env.local
   # Edit .env.local
   npm run dev
   ```

4. **Visit** [http://localhost:5173](http://localhost:5173)

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design
- [API Reference](./docs/API_REFERENCE.md) - Endpoint docs
- [Deployment](./docs/DEPLOYMENT.md) - Production guide
- [Contributing](./CONTRIBUTING.md) - Dev guidelines

## License

MIT License - see [LICENSE](./LICENSE) for details

## Support

- 📧 Email: support@sqlcompass.dev
- 🐛 [Report bugs](https://github.com/yourusername/sql-compass/issues)
- 💡 [Request features](https://github.com/yourusername/sql-compass/issues)
```

---

## Production Readiness

### Security

- [ ] **HTTPS Everywhere**: Use TLS/SSL certificates
- [ ] **CORS Properly Configured**: Only allow frontend domain
  ```typescript
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  ```
- [ ] **Rate Limiting**: Implemented on all endpoints
- [ ] **SQL Injection Prevention**: Use parameterized queries
- [ ] **XSS Protection**: Use CSP headers
  ```typescript
  app.use(helmet());
  ```
- [ ] **CSRF Protection**: If using cookies
- [ ] **Input Validation**: Validate on server side
- [ ] **Secrets Management**: Use environment variables, never hardcode

### Monitoring & Logging

- [ ] **Error Tracking**: Sentry or Rollbar
  ```typescript
  import * as Sentry from "@sentry/node";
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  ```
- [ ] **Performance Monitoring**: DataDog or New Relic
- [ ] **Log Aggregation**: ELK stack or Datadog
- [ ] **Alert Rules**: Pages on critical errors
- [ ] **Uptime Monitoring**: UptimeRobot

### Database

- [ ] **Automated Backups**: Daily backups with 30-day retention
- [ ] **Connection Pooling**: Use PgBouncer or pg-pool
- [ ] **Query Optimization**: Index frequently queried columns
- [ ] **Monitoring**: Track slow queries

### Performance

- [ ] **Caching**: Redis for frequently accessed data
- [ ] **CDN**: CloudFront for frontend assets
- [ ] **Compression**: gzip middleware enabled
- [ ] **Load Testing**: Verify 1000+ concurrent users

### Compliance

- [ ] **GDPR**: User data export functionality
- [ ] **Privacy Policy**: Published and linked
- [ ] **Terms of Service**: Clear usage terms
- [ ] **Data Protection**: Encryption in transit & at rest
- [ ] **CCPA** (if US): Deletion requests honored

---

## Security Checklist

### Code
- [ ] No API keys in repository
- [ ] No passwords in code
- [ ] No `console.log()` of sensitive data
- [ ] Input validation on all endpoints
- [ ] Query parameterization for all SQL
- [ ] CORS restricted to frontend origin

### Infrastructure
- [ ] HTTPS only
- [ ] Firewall rules: Only important ports open
- [ ] Rate limiting on all endpoints
- [ ] Helmet.js for security headers
- [ ] CSRF tokens if using cookies

### Third-Party Services
- [ ] API keys rotated regularly
- [ ] Clerk security configured
- [ ] Google API quota monitoring
- [ ] MongoDB Atlas IP whitelist
- [ ] PostgreSQL encrypted connections

### Deployment
- [ ] Environment variables secured
- [ ] Secrets not in git history
- [ ] Database backups encrypted
- [ ] Access logs maintained
- [ ] SSL certificates valid & renewed

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify database backups completed
- [ ] Check rate limit violations

### Weekly
- [ ] Review user feedback / issues
- [ ] Update dependency security patches
- [ ] Analyze user engagement metrics
- [ ] Review slow query logs

### Monthly
- [ ] Full security audit
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Performance review & optimization
- [ ] Backup restore test
- [ ] Plan next sprint features

### Quarterly
- [ ] Full code review
- [ ] Update documentation
- [ ] Release planning
- [ ] Team retrospective

---

## Version Numbering

Use Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Breaking changes
  - Example: Remove endpoint, change database schema
- **MINOR** (1.1.0): New features, backward compatible
  - Example: Add new assignment type
- **PATCH** (1.0.1): Bug fixes only
  - Example: Fix hint generation error

---

## Release Process

1. **Create Release Branch**
   ```bash
   git checkout -b release/v1.1.0
   ```

2. **Update Version Numbers**
   ```bash
   # backend/package.json
   "version": "1.1.0"
   
   # client/package.json
   "version": "1.1.0"
   ```

3. **Update CHANGELOG.md**
   ```markdown
   ## [1.1.0] - 2025-03-25
   
   ### Added
   - New SQL assignment type
   - Query templates feature
   
   ### Fixed
   - Bug in hint generation
   ```

4. **Merge to Main**
   ```bash
   git commit -am "chore: bump version to 1.1.0"
   git push origin release/v1.1.0
   # Create Pull Request
   # After approval, merge to main
   ```

5. **Create Git Tag**
   ```bash
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin v1.1.0
   ```

6. **Create GitHub Release**
   - Go to Releases
   - Click "Create Release"
   - Select v1.1.0 tag
   - Copy CHANGELOG content
   - Publish release

---

## Scaling Timeline

### Phase 1: MVP (Current)
- Single database instance
- No caching layer
- Manual deployments

### Phase 2: Growth (100+ users)
- Add Redis cache
- Implement CDN
- Automated deployments
- Basic monitoring

### Phase 3: Scale (1000+ users)
- Database read replicas
- Horizontal scaling (multiple instances)
- Advanced monitoring
- Team management features

### Phase 4: Enterprise (10,000+ users)
- Global CDN
- Database sharding
- Advanced security
- SLA guarantees

---

## Support for Contributors

### Starting Point
1. Fork repository
2. Follow setup instructions
3. Pick a "good first issue"
4. Create PR with clear description

### Development Workflow
```bash
# Create feature branch
git checkout -b feat/new-feature

# Make changes and commit
git commit -m "feat: add new feature"

# Push and create PR
git push origin feat/new-feature
```

### Code Review Standards
- At least 1 approval before merge
- All CI tests passing
- No comments from maintainers
- Follows code style

---

## Questions Before Launch?

**Q: Should I open source from day 1?**
A: Yes! More eyes catch bugs. Start with MIT license.

**Q: How do I handle user data backups?**
A: MongoDB Atlas has auto backups. Test restore monthly.

**Q: What if API costs spike?**
A: Set quota alerts in Google Cloud. Implement fallbacks.

**Q: How do I manage secrets in production?**
A: Use environment variables. Never commit `.env` files.

**Q: Should I have a roadmap?**
A: Yes! Post on GitHub discussing future features.

---

## Resources

- [Railway.app Docs](https://docs.railway.app)
- [GitHub Getting Started](https://docs.github.com)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Open Source Guide](https://opensource.guide/)

Good luck launching! 🚀
