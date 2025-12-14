# Pushing to GitHub

This document provides the exact commands to push the generated repository to GitHub.

## 1. Add all files to Git

```bash
git add .
```

## 2. Commit the initial project structure

```bash
git commit -m "feat: initial project structure for Wasilni platform"
```

## 3. Push to the main branch on GitHub

### Using HTTPS

```bash
git push -u origin main
```

### Using SSH

First, ensure your SSH key is added to your GitHub account. Then, update the remote URL:

```bash
git remote set-url origin git@github.com:r-ismail/wasilni-platform.git
```

Then push:

```bash
git push -u origin main
```
```
```
```
```
```
