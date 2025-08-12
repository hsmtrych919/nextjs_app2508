#!/bin/bash

# サテライト投資管理アプリ - マイグレーション管理スクリプト
# Agent 2 - Phase 1-4: D1データベース管理

set -e

DB_NAME="satellite-investment-db"
MIGRATIONS_DIR="db/migrations"

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

# マイグレーション生成
generate_migration() {
    log_info "Generating migration files..."
    
    if ! command -v drizzle-kit &> /dev/null; then
        log_error "drizzle-kit is not available. Installing..."
        npm install drizzle-kit
    fi
    
    # スキーマからマイグレーション生成
    npx drizzle-kit generate:sqlite --config drizzle.config.ts
    
    log_success "Migration files generated in $MIGRATIONS_DIR"
}

# ローカルマイグレーション実行
run_local_migration() {
    log_info "Running migrations on local database..."
    
    for migration in $MIGRATIONS_DIR/*.sql; do
        if [ -f "$migration" ]; then
            log_info "Executing: $(basename "$migration")"
            wrangler d1 execute "$DB_NAME" --local --file="$migration"
        fi
    done
    
    log_success "Local migrations completed"
}

# 本番マイグレーション実行
run_prod_migration() {
    log_warning "Running migrations on PRODUCTION database!"
    read -p "Are you sure? This cannot be undone. (yes/NO): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Migration cancelled"
        return 0
    fi
    
    log_info "Running migrations on production database..."
    
    for migration in $MIGRATIONS_DIR/*.sql; do
        if [ -f "$migration" ]; then
            log_info "Executing: $(basename "$migration")"
            wrangler d1 execute "$DB_NAME" --file="$migration"
        fi
    done
    
    log_success "Production migrations completed"
}

# データベース状態確認
check_database() {
    local env=${1:-"local"}
    
    log_info "Checking database status ($env)..."
    
    if [ "$env" == "local" ]; then
        wrangler d1 execute "$DB_NAME" --local --command="SELECT name FROM sqlite_master WHERE type='table';"
    else
        wrangler d1 execute "$DB_NAME" --command="SELECT name FROM sqlite_master WHERE type='table';"
    fi
}

# データベースリセット（開発用のみ）
reset_local_database() {
    log_warning "Resetting local database - ALL DATA WILL BE LOST!"
    read -p "Continue? (yes/NO): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Reset cancelled"
        return 0
    fi
    
    log_info "Dropping all tables..."
    
    # テーブル一覧取得して削除
    wrangler d1 execute "$DB_NAME" --local --command="
        DROP TABLE IF EXISTS formation_history;
        DROP TABLE IF EXISTS formation_usage;
        DROP TABLE IF EXISTS holdings;
        DROP TABLE IF EXISTS budget;
        DROP TABLE IF EXISTS settings;
    "
    
    log_info "Re-creating tables..."
    run_local_migration
    
    log_success "Local database reset completed"
}

# 使用方法表示
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  generate     Generate migration files from schema"
    echo "  migrate-local    Run migrations on local database"
    echo "  migrate-prod     Run migrations on production database"
    echo "  status-local     Check local database status"
    echo "  status-prod      Check production database status"
    echo "  reset-local      Reset local database (DESTRUCTIVE)"
    echo "  help             Show this help message"
}

# メイン処理
main() {
    case ${1:-help} in
        "generate")
            generate_migration
            ;;
        "migrate-local")
            run_local_migration
            ;;
        "migrate-prod")
            run_prod_migration
            ;;
        "status-local")
            check_database "local"
            ;;
        "status-prod")
            check_database "prod"
            ;;
        "reset-local")
            reset_local_database
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

main "$@"