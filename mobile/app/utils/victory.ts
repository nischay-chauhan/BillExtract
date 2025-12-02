/**
 * Platform-specific Victory Chart exports
 * - Uses victory-native for iOS/Android
 * - Uses victory for Web
 */

import { Platform } from 'react-native';

let VictoryPie: any;
let VictoryBar: any;
let VictoryChart: any;
let VictoryAxis: any;
let VictoryTheme: any;
let VictoryLabel: any;

if (Platform.OS === 'web') {
    // For web, we need to use 'victory' package
    // This will be imported from victory (to be installed)
    try {
        const victory = require('victory');
        VictoryPie = victory.VictoryPie;
        VictoryBar = victory.VictoryBar;
        VictoryChart = victory.VictoryChart;
        VictoryAxis = victory.VictoryAxis;
        VictoryTheme = victory.VictoryTheme;
        VictoryLabel = victory.VictoryLabel;
    } catch (e) {
        console.warn('Victory package not found for web. Charts will not render on web.');
        // Fallback to empty components
        const EmptyComponent = () => null;
        VictoryPie = EmptyComponent;
        VictoryBar = EmptyComponent;
        VictoryChart = EmptyComponent;
        VictoryAxis = EmptyComponent;
        VictoryTheme = { material: {} };
        VictoryLabel = EmptyComponent;
    }
} else {
    // For native (iOS/Android), use victory-native
    const victoryNative = require('victory-native');
    VictoryPie = victoryNative.VictoryPie;
    VictoryBar = victoryNative.VictoryBar;
    VictoryChart = victoryNative.VictoryChart;
    VictoryAxis = victoryNative.VictoryAxis;
    VictoryTheme = victoryNative.VictoryTheme;
    VictoryLabel = victoryNative.VictoryLabel;
}

export {
    VictoryPie,
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryLabel
};
