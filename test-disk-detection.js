#!/usr/bin/env node

const SystemMonitor = require('./server/services/systemMonitor');

async function testDiskDetection() {
    console.log('🧪 Testing disk detection logic...\n');
    
    // Test the disk detection methods
    try {
        console.log('=== Testing Host Disk Info ===');
        const hostDisk = await SystemMonitor.getHostDiskInfo();
        console.log('Host disk result:', hostDisk);
        console.log('');
        
        console.log('=== Testing Hostfs Fallback ===');
        const hostfsDisk = await SystemMonitor.getHostDiskInfoFromHostfs();
        console.log('Hostfs fallback result:', hostfsDisk);
        console.log('');
        
        console.log('=== Testing Alternative Method ===');
        const altDisk = await SystemMonitor.getHostDiskInfoAlternative();
        console.log('Alternative result:', altDisk);
        console.log('');
        
        console.log('=== Testing Primary Disk Selection ===');
        const testDisks = [
            { mount: '/home', fs: '/dev/sda2', size: 100*1024*1024*1024, used: 50*1024*1024*1024, available: 50*1024*1024*1024, use: 50 },
            { mount: '/', fs: '/dev/sda1', size: 200*1024*1024*1024, used: 80*1024*1024*1024, available: 120*1024*1024*1024, use: 40 }
        ];
        const primaryDisk = SystemMonitor.getPrimaryDisk(testDisks);
        console.log('Primary disk from test data:', primaryDisk);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testDiskDetection();
