#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Clean script to remove build artifacts and temporary files
 * Useful for troubleshooting build issues
 */

const dirsToClean = [
    path.join(__dirname, '..', 'server', 'public'),
    path.join(__dirname, '..', 'client', 'build'),
];

const filesToClean = [
    path.join(__dirname, '..', 'server', 'data', 'homelab.db-wal'),
    path.join(__dirname, '..', 'server', 'data', 'homelab.db-shm'),
];

/**
 * Clean old build files - removes all but the most recent main.*.js file
 * @param {string} dir - Directory to clean
 */
function cleanOldBuilds(dir) {
    const jsDir = path.join(dir, 'static', 'js');
    if (!fs.existsSync(jsDir)) return 0;
    
    const files = fs.readdirSync(jsDir);
    const mainFiles = files.filter(f => f.startsWith('main.') && f.endsWith('.js') && !f.includes('.map') && !f.includes('.LICENSE'));
    
    if (mainFiles.length > 1) {
        // Sort by modification time, keep the newest
        const filesWithStats = mainFiles.map(f => ({
            name: f,
            stat: fs.statSync(path.join(jsDir, f))
        })).sort((a, b) => b.stat.mtime - a.stat.mtime);
        
        // Remove all but the newest
        const toRemove = filesWithStats.slice(1);
        let removed = 0;
        
        toRemove.forEach(file => {
            const baseName = file.name.replace('.js', '');
            const relatedFiles = files.filter(f => f.startsWith(baseName));
            
            relatedFiles.forEach(f => {
                const fullPath = path.join(jsDir, f);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`🗑️  Removed old build: ${f}`);
                    removed++;
                }
            });
        });
        
        return removed;
    }
    
    return 0;
}

/**
 * Recursively remove directory
 * @param {string} dir - Directory to remove
 */
function removeDirectory(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️  Removed: ${path.relative(process.cwd(), dir)}`);
        return true;
    }
    return false;
}

/**
 * Remove file
 * @param {string} file - File to remove
 */
function removeFile(file) {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️  Removed: ${path.relative(process.cwd(), file)}`);
        return true;
    }
    return false;
}

console.log('🧹 Starting cleanup...');

let cleanedItems = 0;

// Clean old build files first
const publicDir = path.join(__dirname, '..', 'server', 'public');
if (fs.existsSync(publicDir)) {
    const oldBuildsRemoved = cleanOldBuilds(publicDir);
    cleanedItems += oldBuildsRemoved;
    console.log(`🗑️  Removed ${oldBuildsRemoved} old build files`);
}

// Clean directories (full removal)
for (const dir of dirsToClean) {
    if (removeDirectory(dir)) {
        cleanedItems++;
    }
}

// Clean individual files
for (const file of filesToClean) {
    if (removeFile(file)) {
        cleanedItems++;
    }
}

if (cleanedItems === 0) {
    console.log('✨ Already clean! No build artifacts found.');
} else {
    console.log(`✅ Cleanup complete! Removed ${cleanedItems} items.`);
    console.log('💡 Run "npm run build" to rebuild the application.');
}
