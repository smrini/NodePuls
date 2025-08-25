# Dropdown Z-Index Fix

## Issue
The dropdown menus in the Network and Disk cards were appearing behind the Resource Usage section instead of on top.

## Root Cause
CSS stacking context issue where the dropdown menu's z-index wasn't high enough to appear above other sections of the dashboard.

## Solution Applied

### 1. Increased Dropdown Z-Index
- Changed dropdown menu z-index from `1000` to `9999`

### 2. Added Dynamic Class to Stat Cards
- Added `dropdown-open` class to stat cards when their dropdown is open
- Modified both Disk and Network stat cards in SystemStats.tsx

### 3. Enhanced CSS Stacking Context
- Added CSS rule to give stat cards with open dropdowns a z-index of `10000`
- Used multiple selectors for browser compatibility:
  - `:has(.dropdown-menu)` - for modern browsers
  - `:focus-within` - for focus-based detection
  - `.dropdown-open` - for class-based detection (most reliable)

## Files Modified
- `client/src/components/Dashboard.css` - Updated dropdown z-index and added stacking context rules
- `client/src/components/SystemStats.tsx` - Added dynamic `dropdown-open` class to stat cards

## Result
Dropdown menus now properly appear above all other dashboard content, including the Resource Usage section.

## CSS Changes Made

```css
/* Increased dropdown z-index */
.dropdown-menu {
    z-index: 9999; /* was 1000 */
}

/* Ensure dropdown appears above all other content */
.stat-card:has(.dropdown-menu),
.stat-card:focus-within,
.stat-card.dropdown-open {
    position: relative;
    z-index: 10000;
}
```

## Component Changes Made

```tsx
// Added conditional class based on dropdown state
<div className={`stat-card ${diskDropdownOpen ? 'dropdown-open' : ''}`}>
<div className={`stat-card ${networkDropdownOpen ? 'dropdown-open' : ''}`}>
```
