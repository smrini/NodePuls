# Changelog

All notable changes to the NodePuls project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.3] - 2025-10-23

### Added
- Version information in health API endpoint
- Docker container labels with version and metadata
- Enhanced package.json with repository, homepage, and bug tracker URLs
- MIT LICENSE file
- Comprehensive keywords for better package discoverability
- Logging configuration for production optimization

### Changed
- Updated project description to be consistent across all files: "A beautiful, lightweight real-time homelab monitoring dashboard"
- Enhanced Docker labels for better container metadata
- Improved package.json metadata for npm registry

### Technical
- All version references updated from 1.0.0 to 1.7.3
- Package-lock.json files regenerated with new version
- Health endpoint now returns version, name, and timestamp

## [1.0.0] - Previous Release

### Features
- Real-time system monitoring (CPU, Memory, Disk, Network)
- Website uptime monitoring with health scoring
- Advanced redundant checking system (HEAD → GET → Retry)
- Beautiful dark theme dashboard with responsive design
- WebSocket-powered live updates
- SQLite database for persistent storage
- Docker deployment with multi-stage builds
- JSON import/export for website management
- Drag & drop website reordering
- Cross-platform build system
- Comprehensive API with health checks
- Automated database cleanup
- Smart resource management (monitoring only when clients connected)
