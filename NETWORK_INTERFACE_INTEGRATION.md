# Network Interface Selection for Resource Charts

## Summary of Changes

This update implements the ability for users to select which network interface to monitor in the **Resource Usage** section's **Network Activity** chart. When a user selects a different network interface in the Network card dropdown, the chart data will now reflect the selected interface's traffic instead of the default/primary interface.

## Files Modified

### 1. `client/src/components/Dashboard.tsx`
- **Added state**: `selectedNetworkInterface` to track the currently selected network interface
- **Updated chart data logic**: Chart data construction now uses the selected network interface's `rx_sec` and `tx_sec` values
- **Added callback**: Pass `onNetworkInterfaceChange` callback to `SystemStats` component
- **Enhanced ResourceCharts**: Pass the selected network interface to `ResourceCharts` for display

### 2. `client/src/components/SystemStats.tsx`
- **Added callback prop**: `onNetworkInterfaceChange` to notify parent when interface selection changes
- **Enhanced selection logic**: Calls the callback when:
  - Initial interface is automatically selected
  - User manually selects a different interface
  - Interface data is updated with new values

### 3. `client/src/components/ResourceCharts.tsx`
- **Added prop**: `selectedNetworkInterface` to receive the currently selected interface
- **Enhanced chart title**: Network Activity chart now shows the selected interface name in the title
- **Example**: "Network Activity (Wi-Fi Connection)" instead of just "Network Activity"

## How It Works

1. **Initial Load**: When system data arrives, the dashboard automatically selects the network interface that matches the primary network data, or uses the first available interface
2. **User Selection**: When user selects a different network interface from the Network card dropdown, the selection is communicated to the Dashboard component
3. **Chart Update**: The chart data is recalculated using the selected interface's network traffic data
4. **Visual Feedback**: The Network Activity chart title updates to show which interface is being monitored

## Features

- ✅ **Real-time Updates**: Chart data reflects the currently selected network interface
- ✅ **Visual Feedback**: Chart title shows selected interface name
- ✅ **Automatic Selection**: Sensible default selection on initial load
- ✅ **Smooth Integration**: Works seamlessly with existing dropdown functionality
- ✅ **Type Safety**: Full TypeScript support with proper type definitions

## Usage

1. Open the dashboard
2. Navigate to the Network card in the System Overview section
3. Click the dropdown arrow to see available network interfaces
4. Select any interface from the dropdown
5. Observe that the **Network Activity** chart in the Resource Usage section now displays data for the selected interface
6. The chart title will update to show "(Interface Name)" next to "Network Activity"

## Testing

A test script `test-network-interface-integration.js` has been created to verify the integration logic works correctly with mock data containing multiple network interfaces.

This implementation provides users with granular control over which network interface they want to monitor in the Resource Usage charts, making the dashboard more useful for systems with multiple network connections (Ethernet, Wi-Fi, VPN, Docker bridges, etc.).
