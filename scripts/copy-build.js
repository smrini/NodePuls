#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cross-platform script to copy React build files to server/public
 * Replaces Windows-specific xcopy commands with Node.js implementation
 */

const sourceDir = path.join(__dirname, '..', 'client', 'build');
const targetDir = path.join(__dirname, '..', 'server', 'public');

/**
 * Recursively copy directory contents
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyRecursiveSync(src, dest) {
    // Check if source exists
    if (!fs.existsSync(src)) {
        console.error(`❌ Source directory does not exist: ${src}`);
        console.log(`💡 Run 'npm run build:client' first to create the React build`);
        process.exit(1);
    }

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Get source directory stats
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
        // If destination exists, remove it first to ensure clean copy
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }
        
        // Create destination directory
        fs.mkdirSync(dest, { recursive: true });
        
        // Copy all contents
        const items = fs.readdirSync(src);
        
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            
            const itemStats = fs.statSync(srcPath);
            
            if (itemStats.isDirectory()) {
                copyRecursiveSync(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

/**
 * Get directory size for logging
 * @param {string} dir - Directory path
 * @returns {number} Size in bytes
 */
function getDirectorySize(dir) {
    let size = 0;
    
    if (!fs.existsSync(dir)) return 0;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
            size += getDirectorySize(itemPath);
        } else {
            size += stats.size;
        }
    }
    
    return size;
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
try {
    console.log('🚀 Starting cross-platform build copy...');
    console.log(`📂 Source: ${sourceDir}`);
    console.log(`📁 Target: ${targetDir}`);
    
    const startTime = Date.now();
    
    // Perform the copy
    copyRecursiveSync(sourceDir, targetDir);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Get final size
    const finalSize = getDirectorySize(targetDir);
    
    console.log(`✅ Build files copied successfully!`);
    console.log(`📊 Total size: ${formatBytes(finalSize)}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    // List key files to confirm
    const indexPath = path.join(targetDir, 'index.html');
    const staticPath = path.join(targetDir, 'static');
    
    if (fs.existsSync(indexPath)) {
        console.log(`✅ index.html found`);
    } else {
        console.log(`❌ index.html missing`);
    }
    
    if (fs.existsSync(staticPath)) {
        const staticFiles = fs.readdirSync(staticPath);
        console.log(`✅ Static assets: ${staticFiles.length} folders`);
    } else {
        console.log(`❌ Static assets missing`);
    }
    
    console.log(`🌐 Server will serve React app from: ${targetDir}`);
    
} catch (error) {
    console.error('❌ Error copying build files:', error.message);
    process.exit(1);
}
