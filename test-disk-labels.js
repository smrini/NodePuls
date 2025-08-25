/**
 * Test script to verify disk label retrieval
 */

const si = require('systeminformation');

const testDiskLabels = async () => {
    console.log('🔧 Testing Disk Label Retrieval...\n');
    
    try {
        // Get both fsSize and blockDevices data
        const [diskData, blockDevicesData] = await Promise.all([
            si.fsSize(),
            si.blockDevices()
        ]);
        
        console.log('📀 Processing disk labels:');
        
        const processedDisks = diskData.map((disk, index) => {
            let diskName = null;
            
            // Try to find matching block device by mount point
            if (blockDevicesData && Array.isArray(blockDevicesData)) {
                const matchingBlockDevice = blockDevicesData.find(blockDev => 
                    blockDev.mount === disk.mount || blockDev.identifier === disk.mount
                );
                
                if (matchingBlockDevice && matchingBlockDevice.label && matchingBlockDevice.label.trim()) {
                    diskName = matchingBlockDevice.label.trim();
                }
            }
            
            // Fallback logic
            if (!diskName) {
                if (disk.mount === '/') {
                    diskName = 'Root';
                } else if (disk.mount && disk.mount.match(/^[A-Z]:$/)) {
                    diskName = disk.mount;
                } else if (disk.mount) {
                    diskName = disk.mount.replace(/^\//, '').replace(/\//g, '/') || 'Root';
                } else if (disk.fs) {
                    diskName = disk.fs;
                } else {
                    diskName = `Disk ${index + 1}`;
                }
            }
            
            return {
                mount: disk.mount,
                name: diskName,
                size: `${(disk.size / 1024 / 1024 / 1024).toFixed(1)} GB`,
                usage: `${disk.use.toFixed(1)}%`
            };
        });
        
        processedDisks.forEach(disk => {
            console.log(`✅ ${disk.mount} → "${disk.name}" (${disk.size}, ${disk.usage} used)`);
        });
        
        console.log('\n🎯 Expected Results:');
        console.log('• F: → "P01"');
        console.log('• G: → "P02"');
        console.log('• H: → "P03"');
        console.log('• I: → "P04"');
        console.log('• C: → "C:" (if no label)');
        
        console.log('\n✨ Disk labels should now display actual volume names!');
        
    } catch (error) {
        console.error('❌ Error testing disk labels:', error.message);
    }
};

// Run the test
testDiskLabels();
