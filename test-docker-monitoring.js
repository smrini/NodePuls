#!/usr/bin/env node

// Simple test script to verify Docker system monitoring
const fs = require('fs');
const path = require('path');

console.log('🔍 Docker System Monitoring Test');
console.log('=================================');

// Test Docker detection
const isDocker = fs.existsSync('/.dockerenv') || 
    (fs.existsSync('/proc/1/cgroup') && 
     fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker'));

console.log(`🐳 Docker Environment: ${isDocker ? 'YES' : 'NO'}`);

// Test path availability
const paths = [
    '/proc',
    '/sys', 
    '/host/proc',
    '/host/sys',
    '/hostfs'
];

console.log('\n📂 Path Availability:');
paths.forEach(p => {
    console.log(`  ${p}: ${fs.existsSync(p) ? '✅' : '❌'}`);
});

// Test memory reading
console.log('\n🧠 Memory Information:');
const memPaths = ['/proc/meminfo', '/host/proc/meminfo'];
for (const memPath of memPaths) {
    if (fs.existsSync(memPath)) {
        try {
            const memInfo = fs.readFileSync(memPath, 'utf8');
            const totalMatch = memInfo.match(/MemTotal:\s*(\d+)\s*kB/);
            const availMatch = memInfo.match(/MemAvailable:\s*(\d+)\s*kB/);
            
            if (totalMatch) {
                const totalGB = (parseInt(totalMatch[1]) * 1024 / 1024 / 1024 / 1024).toFixed(2);
                console.log(`  ${memPath}: ${totalGB} GB total`);
                
                if (availMatch) {
                    const availGB = (parseInt(availMatch[1]) * 1024 / 1024 / 1024 / 1024).toFixed(2);
                    const usedGB = (totalGB - availGB).toFixed(2);
                    console.log(`    Used: ${usedGB} GB, Available: ${availGB} GB`);
                }
            }
        } catch (error) {
            console.log(`  ${memPath}: Error reading - ${error.message}`);
        }
    } else {
        console.log(`  ${memPath}: Not found`);
    }
}

// Test network interfaces
console.log('\n🌐 Network Interfaces:');
const netPaths = ['/proc/net/dev', '/host/proc/net/dev'];
for (const netPath of netPaths) {
    if (fs.existsSync(netPath)) {
        try {
            const netDev = fs.readFileSync(netPath, 'utf8');
            const lines = netDev.split('\n').slice(2); // Skip headers
            
            console.log(`  ${netPath}:`);
            let interfaceCount = 0;
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 17) {
                    const ifaceName = parts[0].replace(':', '');
                    if (ifaceName !== 'lo') { // Skip loopback
                        const rxBytes = parseInt(parts[1]) || 0;
                        const txBytes = parseInt(parts[9]) || 0;
                        console.log(`    ${ifaceName}: RX=${rxBytes} bytes, TX=${txBytes} bytes`);
                        interfaceCount++;
                    }
                }
            }
            console.log(`    Total interfaces (excluding lo): ${interfaceCount}`);
        } catch (error) {
            console.log(`  ${netPath}: Error reading - ${error.message}`);
        }
    } else {
        console.log(`  ${netPath}: Not found`);
    }
}

console.log('\n✅ Test completed');
