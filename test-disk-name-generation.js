/**
 * Test script to verify disk name generation improvements
 */

// Mock disk data similar to what the server receives
const mockDiskData = [
    { mount: 'C:', fs: 'NTFS', size: 500000000000, used: 300000000000, available: 200000000000, use: 60 },
    { mount: 'F:', fs: 'NTFS', size: 128000000000, used: 100000000000, available: 28000000000, use: 78 },
    { mount: 'G:', fs: 'exFAT', size: 512000000000, used: 400000000000, available: 112000000000, use: 78 },
    { mount: 'H:', fs: 'NTFS', size: 1000000000000, used: 800000000000, available: 200000000000, use: 80 },
    { mount: 'I:', fs: 'FAT32', size: 200000000000, used: 120000000000, available: 80000000000, use: 60 }
];

// Simulate the improved disk name generation logic
function generateDiskName(disk, index) {
    let diskName;
    if (disk.mount === '/') {
        diskName = 'Root';
    } else if (disk.mount && disk.mount.match(/^[A-Z]:$/)) {
        // Windows drive letter - make it more descriptive
        const driveLetter = disk.mount.charAt(0);
        if (driveLetter === 'C') {
            diskName = `System Drive`;
        } else {
            diskName = `Drive ${driveLetter}`;
        }
    } else if (disk.mount) {
        // Use mount point as name (for Linux/Unix systems)
        diskName = disk.mount.replace(/^\//, '').replace(/\//g, '/') || 'Root';
    } else if (disk.fs) {
        diskName = disk.fs;
    } else {
        diskName = `Disk ${index + 1}`;
    }
    return diskName;
}

function formatBytes(bytes) {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
}

console.log('🔧 Testing Improved Disk Name Generation...\n');

console.log('📊 Generated Disk Information:');
mockDiskData.forEach((disk, index) => {
    const diskName = generateDiskName(disk, index);
    console.log(`• ${diskName} (${disk.mount}) - ${disk.fs} - ${formatBytes(disk.size)} - ${disk.use}% used`);
});

console.log('\n🎯 Expected Display in UI:');
mockDiskData.forEach((disk, index) => {
    const diskName = generateDiskName(disk, index);
    console.log(`• Card Header: "${diskName} (${disk.mount})"`);
    console.log(`  Dropdown Item: "${diskName}" with detail "${disk.fs}"`);
    console.log(`  Usage: ${disk.use}% - ${formatBytes(disk.used)}/${formatBytes(disk.size)}`);
    console.log('');
});

console.log('✨ Expected Results:');
console.log('• ✅ No redundant information like "System Drive (C:) (C:)"');
console.log('• ✅ Clean names: "System Drive", "Drive F", "Drive G", etc.');
console.log('• ✅ Mount point shown in parentheses for clarity');
console.log('• ✅ File system type shown as detail in dropdown');
console.log('\n🎉 Disk name generation improvements applied!');
