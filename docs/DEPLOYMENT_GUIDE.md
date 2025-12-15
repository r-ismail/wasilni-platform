# Wasilni Platform - Production Deployment Guide

**Author**: Manus AI  
**Date**: December 15, 2025

## 1. Introduction

This guide provides a comprehensive overview of the steps required to deploy the Wasilni platform to a production environment. It covers infrastructure setup, deployment procedures, security best practices, and ongoing maintenance.

## 2. Production Architecture

The recommended production architecture is based on a modern, scalable, and cost-effective PaaS (Platform-as-a-Service) model. This approach minimizes infrastructure management overhead and allows for easy scaling.

### 2.1. Core Components

| Component | Technology | Recommended Provider | Notes |
|---|---|---|---|
| **Admin Portal** | Next.js | Vercel | Global CDN, automatic HTTPS, CI/CD |
| **Backend API** | NestJS | Render | Auto-scaling, managed database, private networking |
| **Database** | PostgreSQL + PostGIS | Render | Managed, automated backups, high availability |
| **Cache/Queue** | Redis | Render | Managed, for caching and background jobs |
| **Object Storage** | S3-Compatible | Backblaze B2 / AWS S3 | For storing user uploads (KYC docs, parcel photos) |
| **SMS Gateway** | Twilio / Local Provider | Twilio | For OTP and notifications |
| **CDN / WAF** | Cloudflare | Cloudflare | Security, performance, DDoS protection |

### 2.2. Architecture Overview

- **Frontend (Admin Portal)**: Deployed on Vercel for optimal performance and global availability.
- **Backend (API, Database, Redis)**: Deployed on Render for seamless integration and scalability.
- **Storage**: S3-compatible object storage for file uploads.
- **Security**: Cloudflare for DNS, CDN, and WAF (Web Application Firewall).

## 3. Deployment Prerequisites

Before deploying, you will need accounts with the following services:

- **GitHub**: For source code management and CI/CD triggers.
- **Vercel**: For frontend hosting.
- **Render**: For backend hosting.
- **Cloudflare**: For DNS and security.
- **S3-Compatible Storage Provider**: (e.g., Backblaze B2, AWS S3)
- **SMS Gateway Provider**: (e.g., Twilio)

## 4. Step-by-Step Deployment

### 4.1. Backend Deployment (Render)

1. **Create a new Blueprint** on Render.
2. **Connect your GitHub repository** (`r-ismail/wasilni-platform`).
3. **Add the following services** to your Blueprint:
   - **Web Service (NestJS API)**:
     - **Name**: `wasilni-api`
     - **Environment**: `Node`
     - **Root Directory**: `apps/api`
     - **Build Command**: `pnpm install && pnpm run build`
     - **Start Command**: `pnpm run start:prod`
   - **PostgreSQL Database**:
     - **Name**: `wasilni-db`
     - **Region**: Choose a region close to your users.
   - **Redis Instance**:
     - **Name**: `wasilni-redis`
4. **Configure Environment Variables** for the API service:
   - `DATABASE_URL`: Provided by Render PostgreSQL instance.
   - `REDIS_URL`: Provided by Render Redis instance.
   - `JWT_SECRET`: Generate a strong, random secret.
   - `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_ENDPOINT`: From your S3 provider.
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: From your Twilio account.
5. **Deploy the Blueprint**.

### 4.2. Frontend Deployment (Vercel)

1. **Create a new Project** on Vercel.
2. **Import your GitHub repository** (`r-ismail/wasilni-platform`).
3. **Configure the Project**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/admin`
   - **Build & Development Settings**: Use default Next.js settings.
4. **Configure Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: The public URL of your Render API service (e.g., `https://wasilni-api.onrender.com/api/v1`).
5. **Deploy the Project**.

### 4.3. DNS Configuration (Cloudflare)

1. **Add your domain** to Cloudflare.
2. **Update your domain's nameservers** to Cloudflare's nameservers.
3. **Create CNAME records** for your services:
   - `admin` -> Your Vercel deployment URL.
   - `api` -> Your Render API service URL.
4. **Enable Cloudflare's proxy** (orange cloud) for both records to enable CDN and WAF.

## 5. Security Best Practices

- **Environment Variables**: Never hardcode secrets. Use environment variables for all sensitive data.
- **CORS**: Configure CORS on the NestJS API to only allow requests from your admin portal's domain.
- **Rate Limiting**: Implement rate limiting on the API to prevent abuse.
- **Input Validation**: Use validation pipes in NestJS to sanitize all incoming data.
- **HTTPS**: Enforce HTTPS on all services (Vercel and Render do this by default).
- **WAF**: Use Cloudflare's Web Application Firewall to protect against common vulnerabilities.

## 6. Monitoring and Maintenance

- **Logging**: Use a logging service (e.g., Logtail, Datadog) to aggregate logs from all services.
- **Error Tracking**: Integrate an error tracking service (e.g., Sentry) to get real-time alerts on exceptions.
- **Uptime Monitoring**: Use a service like UptimeRobot to monitor the availability of your API and admin portal.
- **Database Backups**: Configure automated backups for your PostgreSQL database on Render.

## 7. Cost Estimation

- **Vercel**: Generous free tier for personal projects. Paid plans start at $20/user/month.
- **Render**: Free tiers available for web services, PostgreSQL, and Redis. Paid plans scale with usage.
- **Cloudflare**: Free plan offers robust DNS, CDN, and WAF features.
- **S3 Storage**: Costs are typically very low, based on storage and bandwidth usage.
- **SMS Gateway**: Costs vary by provider and usage.

For a small-scale launch, you can likely operate within the free tiers of these services, with minimal costs for storage and SMS.

## 8. Conclusion

By following this guide, you can deploy the Wasilni platform to a secure, scalable, and cost-effective production environment. The use of PaaS providers like Vercel and Render significantly simplifies the deployment and maintenance process, allowing you to focus on building and growing your platform.
