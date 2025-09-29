#!/bin/bash

# Code Review Script for Luxury E-commerce Project
# This script provides easy commands to run local code reviews

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_tools() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    print_success "npm found"
}

# Full project review
full_review() {
    print_status "Running full project review..."
    npm run lint
    npm run security:audit
    print_success "Full review completed"
}

# Linting only
lint_review() {
    print_status "Running ESLint review..."
    npm run lint
    print_success "Linting completed"
}

# Security review
security_review() {
    print_status "Running security audit..."
    npm run security:audit
    print_success "Security review completed"
}

# Fix linting issues
fix_lint() {
    print_status "Fixing auto-fixable linting issues..."
    npm run lint:fix
    print_success "Lint fixes completed"
}

# Review specific files
review_files() {
    local files="$1"
    if [ -z "$files" ]; then
        print_error "Please specify files to review"
        echo "Usage: $0 files 'path/to/file1.js path/to/file2.js'"
        exit 1
    fi
    
    print_status "Reviewing specific files: $files"
    npx eslint $files
    print_success "File review completed"
}

# Review client-side code
client_review() {
    print_status "Running client-side code review..."
    npm run lint:client
    print_success "Client review completed"
}

# Review server-side code
server_review() {
    print_status "Running server-side code review..."
    npm run lint:server
    print_success "Server review completed"
}

# Install dependencies
install_deps() {
    print_status "Installing review dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Show help
show_help() {
    echo "Code Review Script for Luxury E-commerce Project"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  full                    Run full project review (lint + security)"
    echo "  lint                    Run ESLint only"
    echo "  security                Run security audit only"
    echo "  fix                     Fix auto-fixable linting issues"
    echo "  client                  Review client-side code only"
    echo "  server                  Review server-side code only"
    echo "  files 'file1 file2'     Review specific files"
    echo "  install                 Install review dependencies"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 full"
    echo "  $0 lint"
    echo "  $0 files 'client/src/context/AuthContext.js'"
    echo "  $0 fix"
    echo ""
    echo "Note: For CodeRabbit integration, set up GitHub integration at coderabbit.ai"
    echo ""
}

# Main script logic
main() {
    # Check if required tools are available
    check_tools
    
    case "${1:-help}" in
        "full")
            full_review
            ;;
        "lint")
            lint_review
            ;;
        "security")
            security_review
            ;;
        "fix")
            fix_lint
            ;;
        "client")
            client_review
            ;;
        "server")
            server_review
            ;;
        "files")
            review_files "$2"
            ;;
        "install")
            install_deps
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"