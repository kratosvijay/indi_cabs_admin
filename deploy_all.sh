#!/bin/bash
set -e # Stop on error

# Configuration
USERNAME="kratosvijay"
# Detect current git email, or fallback to placeholder
EMAIL=$(git config --get user.email || echo "dillivijay123@gmail.com") 

echo "🚀 Starting Automated Deployment for $USERNAME..."

# 0. Cleanup
rm -rf deploy_temp

# 1. Setup Profile README
echo "📝 Step 1: Deploying Profile README..."
mkdir -p deploy_temp/profile
cp ../profile_readme.md deploy_temp/profile/README.md
cd deploy_temp/profile
git init
git config user.name "$USERNAME"
git config user.email "$EMAIL"
git add .
git commit -m "Initialize profile README"
git branch -M main
git remote add origin "https://github.com/$USERNAME/$USERNAME.git"
echo "Pushing README to GitHub..."
git push -u origin main -f
cd ../..

# 2. Build & Deploy Portfolio Website
echo "🖥️ Step 2: Building Portfolio Website..."
cd ../portfolio
export PATH=$PATH:/usr/local/bin
npm config set cache /Users/kingofhell/Projects/indi_cabs_admin/.npm-cache
npm run build

if [ -d "out" ]; then
    echo "✅ Build successful. Preparing for site deployment..."
    cd ../indi_cabs_admin
    mkdir -p deploy_temp/site
    cp -r ../portfolio/out/* deploy_temp/site/
    cd deploy_temp/site
    touch .nojekyll # Disable Jekyll to allow folders starting with _
    # Fix absolute paths to relative paths for GitHub Pages
    sed -i '' 's/href=\"\/_next/href=\".\/_next/g' index.html
    sed -i '' 's/src=\"\/_next/src=\".\/_next/g' index.html
    sed -i '' 's/href=\"\/favicon.ico/href=\".\/favicon.ico/g' index.html
    sed -i '' 's/src=\"\/indi_logo.png/src=\".\/indi_logo.png/g' index.html
    
    git init
    git config user.name "$USERNAME"
    git config user.email "$EMAIL"
    git add .
    git commit -m "Deploy premium portfolio site"
    git branch -M main
    git remote add origin "https://github.com/$USERNAME/$USERNAME.github.io.git"
    echo "Pushing site to GitHub Pages..."
    git push -u origin main -f
    cd ../..
else
    echo "❌ Build failed. Please check the logs."
    exit 1
fi

echo "🎉 DEPLOYMENT COMPLETE!"
echo "-----------------------------------"
echo "Profile: https://github.com/$USERNAME"
echo "Website: https://$USERNAME.github.io"
echo "-----------------------------------"
