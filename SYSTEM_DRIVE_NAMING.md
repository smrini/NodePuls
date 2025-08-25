# System Drive Naming Enhancement

## Improvement Made
Enhanced the disk naming logic to give the C: drive a more descriptive name "System" instead of just showing "C:".

## Problem Solved
Previously, the C: drive (system drive) would display as just "C:" which is not very descriptive. Users now see a cleaner, more meaningful name.

## Changes Made

### File: `server/services/systemMonitor.js`

**Enhanced the disk name generation logic:**

```javascript
// Special handling for system drive (C:)
if (disk.mount === 'C:') {
    diskName = 'System';
} else {
    // Just use the drive letter for other Windows drives without labels
    diskName = disk.mount;
}
```

## Result

### Before:
- C: → "C:"
- F: → "P01" (if has custom label) or "F:" (if no label)
- G: → "P02" (if has custom label) or "G:" (if no label)

### After:
- C: → **"System"** ✨
- F: → "P01" (if has custom label) or "F:" (if no label)
- G: → "P02" (if has custom label) or "G:" (if no label)

## Benefits

1. **Better UX**: Users immediately understand which drive is the system drive
2. **Consistency**: Professional appearance matching other system monitoring tools
3. **Clarity**: "System" is more descriptive than just "C:"
4. **Maintains Functionality**: Custom disk labels (like "P01", "P02") still work perfectly

## Disk Name Priority Logic

1. **Custom Label**: If a disk has a volume label (like "P01", "ventoy"), use that
2. **System Drive**: If it's C: drive with no label, use "System"
3. **Drive Letter**: For other drives with no label, use the drive letter (D:, E:, etc.)
4. **Fallback**: Generic names like "Disk 1", "Disk 2" if nothing else works

The C: drive now displays as "System" providing a cleaner, more professional appearance in both the disk card and dropdown menu.
