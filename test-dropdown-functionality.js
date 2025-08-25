#!/usr/bin/env node

/**
 * Test script to verify dropdown functionality
 * This script tests the enhanced system monitoring with dropdown support
 */

const SystemMonitor = require('./server/services/systemMonitor');

async function testDropdownFunctionality() {
    console.log('🧪 Testing System Stats Dropdown Functionality...\n');
    
    try {
        console.log('=== Testing System Info with Dropdown Data ===');
        const systemData = await SystemMonitor.getSystemInfo();
        
        console.log('\n📊 System Data Structure:');
        console.log(`  CPU Usage: ${systemData.cpu.usage.toFixed(1)}%`);
        console.log(`  Memory Usage: ${systemData.memory.percentage.toFixed(1)}%`);
        console.log(`  Disk Usage: ${systemData.disk.percentage.toFixed(1)}%`);
        console.log(`  Network RX: ${systemData.network.rx_sec} bytes/sec`);
        console.log(`  Network TX: ${systemData.network.tx_sec} bytes/sec`);
        
        console.log('\n💾 Available Disks:');
        if (systemData.disks && systemData.disks.length > 0) {
            systemData.disks.forEach((disk, index) => {
                console.log(`  ${index + 1}. ${disk.name} (${disk.mount})`);
                console.log(`     Usage: ${disk.percentage.toFixed(1)}% - ${disk.fs}`);
            });
        } else {
            console.log('  No additional disks found');
        }
        
        console.log('\n🌐 Available Network Interfaces:');
        if (systemData.networkInterfaces && systemData.networkInterfaces.length > 0) {
            systemData.networkInterfaces.forEach((iface, index) => {
                console.log(`  ${index + 1}. ${iface.name}`);
                console.log(`     Type: ${iface.type} - Interface: ${iface.iface}`);
                console.log(`     Traffic: ↓${formatBytes(iface.rx_sec)}/s ↑${formatBytes(iface.tx_sec)}/s`);
            });
        } else {
            console.log('  No additional network interfaces found');
        }
        
        console.log('\n✅ Dropdown functionality test completed successfully!');
        console.log('\nThe frontend should now display dropdown menus when multiple options are available.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

testDropdownFunctionality();
