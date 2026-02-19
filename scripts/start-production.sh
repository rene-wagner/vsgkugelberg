#!/bin/bash

# ===============================
# VSG Kugelberg Production Startup Script
# ===============================
# Usage: ./scripts/start-production.sh [command]
# Commands:
#   start   - Build and start all services (default)
#   stop    - Stop all services
#   restart - Restart all services
#   logs    - Show service logs
#   status  - Show service status
#   build   - Build images without starting
#   pull    - Pull latest code and rebuild
#   migrate - Run database migration/seeding tool

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

# ===============================
# Helper Functions
# ===============================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ===============================
# Environment Check
# ===============================

check_env_file() {
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found!"
        log_info "Create it from the template:"
        echo "  cp .env.production.example .env.production"
        echo "  # Then edit .env.production with your values"
        exit 1
    fi
    log_success "Environment file found"
}

check_required_vars() {
    local missing_vars=()

    # Source the env file
    set -a
    source .env.production
    set +a

    # Check required variables
    local required_vars=(
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "POSTGRES_DB"
        "JWT_SECRET"
        "HONEYPOT_SECRET"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi

    log_success "Required environment variables are set"
}

check_traefik_network() {
    if ! docker network ls | grep -q "traefik"; then
        log_warning "Traefik network not found. Creating it..."
        docker network create traefik
        log_success "Traefik network created"
    else
        log_success "Traefik network exists"
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi

    log_success "Docker is available"
}

# ===============================
# Commands
# ===============================

cmd_build() {
    log_info "Building Docker images..."
    docker compose --env-file .env.production build
    log_success "Images built successfully"
}

cmd_start() {
    log_info "Starting production environment..."

    check_docker
    check_env_file
    check_required_vars
    check_traefik_network

    log_info "Building and starting services..."
    docker compose --env-file .env.production up -d --build

    log_success "Services started successfully!"
    echo ""
    cmd_status
    echo ""
    log_info "View logs with: $0 logs"
    log_info "API available at: https://vsgapi.rwgnr.de"
    log_info "Web available at: https://vsgweb.rwgnr.de"
}

cmd_stop() {
    log_info "Stopping services..."
    docker compose --env-file .env.production down
    log_success "Services stopped"
}

cmd_restart() {
    log_info "Restarting services..."
    cmd_stop
    cmd_start
}

cmd_logs() {
    local service="${1:-}"
    if [ -n "$service" ]; then
        docker compose --env-file .env.production logs -f "$service"
    else
        docker compose --env-file .env.production logs -f
    fi
}

cmd_status() {
    log_info "Service Status:"
    docker compose --env-file .env.production ps
}

cmd_pull() {
    log_info "Pulling latest changes..."
    git pull
    log_info "Rebuilding and restarting..."
    cmd_restart
}

cmd_migrate() {
    log_info "Running database migration tool..."

    check_docker
    check_env_file
    check_required_vars

    # Check if data directory exists
    if [ ! -d "tools/migrate/data" ]; then
        log_error "Migration data directory not found: tools/migrate/data"
        log_info "Please ensure CSV data files are in tools/migrate/data/"
        exit 1
    fi

    # Ensure postgres is running
    if ! docker compose --env-file .env.production ps postgres | grep -q "running"; then
        log_warning "PostgreSQL is not running. Starting it first..."
        docker compose --env-file .env.production up -d postgres
        log_info "Waiting for PostgreSQL to be healthy..."
        sleep 10
    fi

    # Run migration with profile
    log_info "Starting migration container..."
    docker compose --env-file .env.production --profile migrate run --rm migrate

    log_success "Migration completed!"
}

# ===============================
# Main
# ===============================

show_help() {
    echo "VSG Kugelberg Production Startup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all services (default)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show service logs (optionally: logs [service])"
    echo "  status    Show service status"
    echo "  build     Build images without starting"
    echo "  pull      Pull latest code and rebuild"
    echo "  migrate   Run database migration/seeding tool"
    echo "  help      Show this help message"
}

# Parse command
COMMAND="${1:-start}"

case "$COMMAND" in
    start)
        cmd_start
        ;;
    stop)
        cmd_stop
        ;;
    restart)
        cmd_restart
        ;;
    logs)
        cmd_logs "${2:-}"
        ;;
    status)
        cmd_status
        ;;
    build)
        check_docker
        check_env_file
        check_required_vars
        cmd_build
        ;;
    pull)
        cmd_pull
        ;;
    migrate)
        cmd_migrate
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac
