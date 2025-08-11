#!/bin/bash

# サテライト投資管理アプリ - 本番環境デプロイスクリプト
# Agent 2 - Phase 3項目2: Workers本番デプロイ設定

set -e

echo "🚀 Satellite Investment App - Production Deployment"
echo "=================================================="

# 色付きログ関数
log_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

log_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

log_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

log_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

# 前提条件チェック
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # wrangler の認証確認
    if ! wrangler whoami &> /dev/null; then
        log_error "Wrangler authentication required. Please run:"
        echo "wrangler auth login"
        exit 1
    fi
    
    # 本番データベースIDの確認
    if grep -q "your-prod-database-id-here" wrangler.toml; then
        log_error "Production database ID not configured in wrangler.toml"
        log_info "Please run: wrangler d1 create satellite-investment-db-prod"
        log_info "And update the database_id in wrangler.toml"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# ビルドの実行
run_build() {
    log_info "Building application for production..."
    
    npm run build:deploy
    
    if [ ! -d "_dist" ]; then
        log_error "Build failed - _dist directory not found"
        exit 1
    fi
    
    log_success "Build completed successfully"
}

# 本番データベースマイグレーション
run_production_migrations() {
    log_info "Checking production database migrations..."
    
    read -p "Run database migrations on production? (y/N): " run_migrations
    if [[ $run_migrations =~ ^[Yy]$ ]]; then
        npm run db:migrate:prod
        log_success "Production migrations completed"
    else
        log_warning "Skipping database migrations"
    fi
}

# 本番環境デプロイ
deploy_to_production() {
    log_info "Deploying to Cloudflare Pages (Production)..."
    
    wrangler pages deploy _dist --env=production
    
    log_success "Production deployment completed"
}

# デプロイ後検証
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Pages の一覧確認
    wrangler pages list
    
    log_info "Please verify the following:"
    echo "1. Application loads correctly"
    echo "2. API endpoints respond properly"  
    echo "3. Database connection works"
    echo "4. Cron triggers are active"
    
    log_success "Deployment verification complete"
}

# メイン実行
main() {
    echo
    log_warning "This will deploy to PRODUCTION environment!"
    echo
    read -p "Continue with production deployment? (yes/NO): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    echo
    log_info "Starting production deployment process..."
    echo
    
    check_prerequisites
    echo
    
    run_build
    echo
    
    run_production_migrations
    echo
    
    deploy_to_production
    echo
    
    verify_deployment
    echo
    
    log_success "🎉 Production deployment completed successfully!"
    echo
    log_info "Your app is now live on Cloudflare Pages"
    echo
}

# スクリプト実行
main "$@"