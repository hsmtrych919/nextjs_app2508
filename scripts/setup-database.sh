#!/bin/bash

# サテライト投資管理アプリ - Cloudflare D1 データベース設定スクリプト
# Agent 2 - Phase 1-4: D1データベース作成準備

set -e

echo "🚀 Satellite Investment App - D1 Database Setup"
echo "=============================================="

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

# 環境チェック
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Please install it first:"
        echo "npm install -g wrangler"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi

    log_success "Dependencies check passed"
}

# D1データベース作成
create_database() {
    log_info "Creating D1 database..."

    local db_name="satellite-investment-db"

    # データベース作成（既存の場合はスキップ）
    if wrangler d1 list | grep -q "$db_name"; then
        log_warning "Database '$db_name' already exists, skipping creation"
    else
        log_info "Creating new database: $db_name"
        wrangler d1 create "$db_name"
        log_success "Database created successfully"
    fi

    # データベースIDを取得してwrangler.tomlに設定するよう指示
    log_info "Please update wrangler.toml with the database ID:"
    log_info "Run: wrangler d1 list"
    log_info "Copy the database_id and update it in wrangler.toml"
}

# マイグレーション実行
run_migrations() {
    log_info "Running database migrations..."

    local migration_file="db/migrations/0001_initial.sql"
    local db_name="satellite-investment-db"

    if [ ! -f "$migration_file" ]; then
        log_error "Migration file not found: $migration_file"
        log_info "Please run: npx drizzle-kit generate:sqlite"
        exit 1
    fi

    log_info "Executing migration..."
    wrangler d1 execute "$db_name" --file="$migration_file"

    log_success "Migration completed successfully"
}

# 開発用ローカルデータベース設定
setup_local_database() {
    log_info "Setting up local development database..."

    # ローカル開発用のD1データベース作成
    wrangler d1 execute satellite-investment-db --local --file="db/migrations/0001_initial.sql"

    log_success "Local development database setup complete"
}

# メイン実行
main() {
    echo
    log_info "Starting D1 database setup process..."
    echo

    check_dependencies

    echo
    read -p "Create production database? (y/N): " create_prod
    if [[ $create_prod =~ ^[Yy]$ ]]; then
        create_database
        echo
        read -p "Run migrations on production database? (y/N): " run_prod_migrations
        if [[ $run_prod_migrations =~ ^[Yy]$ ]]; then
            run_migrations
        fi
    fi

    echo
    read -p "Setup local development database? (Y/n): " setup_local
    if [[ ! $setup_local =~ ^[Nn]$ ]]; then
        setup_local_database
    fi

    echo
    log_success "Database setup process completed!"
    echo
    log_info "Next steps:"
    echo "1. Update wrangler.toml with your database ID"
    echo "2. Test the setup: wrangler d1 execute satellite-investment-db --command='SELECT * FROM settings;'"
    echo "3. Deploy your app: npm run build && wrangler pages deploy _dist"
    echo
}

# スクリプト実行
main "$@"