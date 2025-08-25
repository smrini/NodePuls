# Disk Name Display Fix

## Issue
Disk names were showing redundant information:
- "System Drive (C:)" followed by "C:" on separate lines
- "Drive F (F:)" followed by "F:" on separate lines

## Root Cause
The SystemStats component was displaying both `selectedDisk.name` and `selectedDisk.mount` separately, causing redundant information since the server-generated names already include the drive letter information.

## Solution
Updated the SystemStats component to display only the disk name (`selectedDisk.name`) without showing the mount point separately.

## Change Made

### File: `client/src/components/SystemStats.tsx`

**Before:**
```tsx
{selectedDisk && (
    <div className="detail">
        <span className="selected-device">
            {selectedDisk.name} ({selectedDisk.mount})
        </span>
    </div>
)}
```

**After:**
```tsx
{selectedDisk && (
    <div className="detail">
        <span className="selected-device">
            {selectedDisk.name}
        </span>
    </div>
)}
```

## Result
Now disk names display cleanly:
- ✅ "System Drive (C:)" (instead of "System Drive (C:) (C:)")
- ✅ "Drive F" (instead of "Drive F (F:)")
- ✅ "Drive G" (instead of "Drive G (G:)")

The dropdown menu continues to show the disk name with filesystem type as detail (e.g., "System Drive (C:)" with "NTFS" as detail).

## Files Modified
- `client/src/components/SystemStats.tsx` - Removed redundant mount point display

This fix ensures clean, non-redundant disk name display throughout the dashboard.
