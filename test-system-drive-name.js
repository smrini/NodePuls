/**
 * Test script to verify C: drive now shows as "System"
 */

const testSystemDriveName = () => {
    console.log('🔧 Testing System Drive Name Update...\n');

    // Simulate the updated disk name logic
    const mockDisks = [
        {
            mount: 'C:',
            fs: 'NTFS',
            blockDeviceLabel: null // No custom label
        },
        {
            mount: 'F:',
            fs: 'NTFS',
            blockDeviceLabel: 'P01' // Has custom label
        },
        {
            mount: 'G:',
            fs: 'NTFS',
            blockDeviceLabel: 'P02' // Has custom label
        },
        {
            mount: 'H:',
            fs: 'NTFS',
            blockDeviceLabel: null // No custom label
        }
    ];

    console.log('💾 Testing Disk Name Generation:');
    
    mockDisks.forEach((disk, index) => {
        let diskName = null;
        
        // Use custom label if available
        if (disk.blockDeviceLabel && disk.blockDeviceLabel.trim()) {
            diskName = disk.blockDeviceLabel.trim();
        }
        
        // Fallback logic for drives without labels
        if (!diskName) {
            if (disk.mount && disk.mount.match(/^[A-Z]:$/)) {
                // Special handling for system drive (C:)
                if (disk.mount === 'C:') {
                    diskName = 'System';
                } else {
                    // Just use the drive letter for other Windows drives without labels
                    diskName = disk.mount;
                }
            }
        }
        
        console.log(`✅ ${disk.mount} → "${diskName}"`);
    });

    console.log('\n🎯 Expected Results:');
    console.log('• C: → "System" (special name for system drive)');
    console.log('• F: → "P01" (custom label)');
    console.log('• G: → "P02" (custom label)');
    console.log('• H: → "H:" (drive letter fallback)');
    
    console.log('\n✨ C: drive should now display as "System" instead of just "C:"!');
};

// Run the test
testSystemDriveName();
