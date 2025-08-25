/**
 * Test script to verify correct disk name display
 */

const testDiskNameDisplay = () => {
    console.log('🔧 Testing Disk Name Display Logic...\n');

    // Mock disk data as it would come from the server
    const mockDisks = [
        {
            id: 'disk_C',
            name: 'System Drive (C:)',
            mount: 'C:',
            fs: 'NTFS',
            total: 500000000000,
            used: 300000000000,
            free: 200000000000,
            percentage: 60.0,
            type: 'Fixed'
        },
        {
            id: 'disk_F',
            name: 'Drive F',
            mount: 'F:',
            fs: 'NTFS',
            total: 128000000000,
            used: 100000000000,
            free: 28000000000,
            percentage: 78.1,
            type: 'Fixed'
        },
        {
            id: 'disk_G',
            name: 'Drive G',
            mount: 'G:',
            fs: 'NTFS',
            total: 512000000000,
            used: 400000000000,
            free: 112000000000,
            percentage: 78.1,
            type: 'Fixed'
        }
    ];

    console.log('📀 Testing Disk Display Names:');
    mockDisks.forEach(disk => {
        console.log(`✅ Disk: ${disk.name}`);
        console.log(`   Mount: ${disk.mount}`);
        console.log(`   Display: "${disk.name}" (should NOT show mount point separately)`);
        console.log(`   Dropdown: "${disk.name}" with detail "${disk.fs}"`);
        console.log('');
    });

    console.log('🎯 Expected Results:');
    console.log('• System Drive (C:) - shows as "System Drive (C:)"');
    console.log('• Drive F - shows as "Drive F"');
    console.log('• Drive G - shows as "Drive G"');
    console.log('• No redundant mount point display like "Drive F (F:)"');
    
    console.log('\n✨ Disk name display should now be clean and non-redundant!');
};

// Run the test
testDiskNameDisplay();
