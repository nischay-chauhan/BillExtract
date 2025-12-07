import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { View, ScrollView, TouchableOpacity, Text, Platform, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, BarChart } from "react-native-gifted-charts";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from "nativewind";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import LottieView from 'lottie-react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';

import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import { wp, hp, spacing, isSmallDevice } from "../utils/responsive";
import { getSpendingByCategory } from "../api/receipts";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DateRange = "week" | "month" | "year" | "custom";

// Format currency with Indian notation and handle overflow
const formatCurrency = (amount: number, compact = false): string => {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Category helpers - defined outside component to prevent recreation
const CATEGORY_COLORS: Record<string, string> = {
  grocery: "#4CAF50",
  restaurant: "#FF9800",
  petrol: "#2196F3",
  pharmacy: "#E91E63",
  electronics: "#9C27B0",
  food_delivery: "#FF5722",
  parking: "#607D8B",
  toll: "#795548",
  general: "#757575",
};

const CATEGORY_LABELS: Record<string, string> = {
  grocery: "Grocery",
  restaurant: "Restaurant",
  petrol: "Petrol/Fuel",
  pharmacy: "Pharmacy",
  electronics: "Electronics",
  food_delivery: "Food Delivery",
  parking: "Parking",
  toll: "Toll",
  general: "General",
};

const getCategoryColor = (category: string) => CATEGORY_COLORS[category] || "#757575";
const getCategoryLabel = (category: string) => CATEGORY_LABELS[category] || category;

const GlassCard = memo(({ children, style, isDark }: {
  children: React.ReactNode;
  style?: any;
  isDark: boolean;
}) => (
  <View
    style={[
      styles.glassCard,
      {
        backgroundColor: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      },
      style
    ]}
  >
    {children}
  </View>
));

// Memoized Category Row - prevents re-render of all rows when one changes
const CategoryRow = memo(({ item, isDark }: { item: any; isDark: boolean }) => (
  <GlassCard
    isDark={isDark}
    style={{ marginBottom: spacing.sm, padding: spacing.md }}
  >
    <View style={styles.categoryRowContent}>
      <View style={styles.categoryRowLeft}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: getCategoryColor(item.category) }
          ]}
        />
        <View style={styles.categoryTextContainer}>
          <Subtitle numberOfLines={1}>{getCategoryLabel(item.category)}</Subtitle>
          <Caption style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            {item.count} receipt{item.count !== 1 ? 's' : ''}
          </Caption>
        </View>
      </View>
      <Text
        style={[
          styles.categoryAmount,
          { color: isDark ? '#fff' : '#1f2937' }
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrency(item.total)}
      </Text>
    </View>
  </GlassCard>
));

const AnalyticsScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customStartDate, setCustomStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll animation for parallax header
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, 100], [0, -15], Extrapolate.CLAMP) },
      { scale: interpolate(scrollY.value, [0, 100], [1, 0.95], Extrapolate.CLAMP) },
    ],
    opacity: interpolate(scrollY.value, [0, 80], [1, 0.7], Extrapolate.CLAMP),
  }));

  const onDateChange = useCallback((event: any, selectedDate?: Date) => {
    const type = showDatePicker;
    setShowDatePicker(null);
    if (selectedDate && type) {
      if (type === 'start') setCustomStartDate(selectedDate);
      if (type === 'end') setCustomEndDate(selectedDate);
    }
  }, [showDatePicker]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      if (dateRange === "week") startDate = new Date(now.getTime() - 7 * 86400000);
      if (dateRange === "month") startDate = new Date(now.getTime() - 30 * 86400000);
      if (dateRange === "year") startDate = new Date(now.getTime() - 365 * 86400000);
      if (dateRange === "custom") {
        startDate = customStartDate;
        endDate = customEndDate;
      }

      const data = await getSpendingByCategory(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      setCategoryData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const { totalSpending, totalReceipts, topCategory } = useMemo(() => ({
    totalSpending: categoryData.reduce((s, i) => s + i.total, 0),
    totalReceipts: categoryData.reduce((s, i) => s + i.count, 0),
    topCategory: categoryData[0] || null,
  }), [categoryData]);

  const pieData = useMemo(() =>
    categoryData.map(item => ({
      value: item.total,
      color: getCategoryColor(item.category),
      text: formatCurrency(item.total, true),
    })), [categoryData]);

  const barData = useMemo(() =>
    categoryData.slice(0, 5).map(item => ({
      value: item.total,
      label: getCategoryLabel(item.category).slice(0, 6),
      frontColor: '#6366f1',
    })), [categoryData]);

  const maxBarValue = useMemo(() =>
    Math.max(...barData.map(item => item.value), 1), [barData]);

  // Date range button press handlers
  const handleDateRangePress = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  return (
    <ScreenWrapper>
      {/* SVG Gradient Background */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isDark ? "#0f0f1a" : "#f8faff"} stopOpacity="1" />
            <Stop offset="50%" stopColor={isDark ? "#1a1a2e" : "#f0f4ff"} stopOpacity="1" />
            <Stop offset="100%" stopColor={isDark ? "#0d0d1a" : "#e8efff"} stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" />
      </Svg>

      <View style={styles.container}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[headerAnimatedStyle, styles.header]}>
            <Title>Analytics</Title>
            <Body style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              Track your spending patterns
            </Body>
          </Animated.View>

          <View style={styles.dateRangeWrapper}>
            <View
              style={[
                styles.dateRangeContainer,
                { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" }
              ]}
            >
              {(["week", "month", "year", "custom"] as DateRange[]).map((range) => (
                <TouchableOpacity
                  key={range}
                  onPress={() => handleDateRangePress(range)}
                  style={[
                    styles.dateRangeButton,
                    dateRange === range && styles.dateRangeButtonActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateRangeText,
                      {
                        color: dateRange === range ? "#fff" : (isDark ? "#9ca3af" : "#4b5563"),
                        fontWeight: dateRange === range ? "600" : "400",
                      }
                    ]}
                  >
                    {range === "week" ? "7D" : range === "month" ? "30D" : range === "year" ? "1Y" : "Custom"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Date Picker */}
          {dateRange === "custom" && (
            <View style={styles.customDateContainer}>
              <TouchableOpacity
                onPress={() => setShowDatePicker("start")}
                style={[
                  styles.customDateButton,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  }
                ]}
                activeOpacity={0.7}
              >
                <Caption style={{ color: isDark ? '#9ca3af' : 'gray' }}>From</Caption>
                <Body>{customStartDate.toLocaleDateString()}</Body>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDatePicker("end")}
                style={[
                  styles.customDateButton,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  }
                ]}
                activeOpacity={0.7}
              >
                <Caption style={{ color: isDark ? '#9ca3af' : 'gray' }}>To</Caption>
                <Body>{customEndDate.toLocaleDateString()}</Body>
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={showDatePicker === "start" ? customStartDate : customEndDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <LottieView
                source={require('../../assets/animations/loading-chart.json')}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
              />
              <Caption style={{ marginTop: spacing.sm, color: isDark ? '#9ca3af' : '#6b7280' }}>
                Loading analytics...
              </Caption>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <GlassCard isDark={isDark}>
              <Body style={{ textAlign: 'center', color: '#ef4444' }}>{error}</Body>
            </GlassCard>
          )}

          {/* Empty State */}
          {!loading && !error && categoryData.length === 0 && (
            <GlassCard isDark={isDark} style={{ padding: spacing.xl }}>
              <Body style={{ textAlign: 'center', color: isDark ? '#9ca3af' : '#6b7280' }}>
                No spending data for this period
              </Body>
            </GlassCard>
          )}
          {!loading && !error && categoryData.length > 0 && (
            <>
              <View style={styles.statCardsContainer}>
                <View style={styles.statCardWrapper}>
                  <LinearGradient
                    colors={["#8b5cf6", "#7c3aed"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                  >
                    <View style={styles.statIconContainer}>
                      <Text style={styles.statIcon}>💰</Text>
                    </View>
                    <Caption style={styles.statLabel}>Total Spending</Caption>
                    <Text
                      style={styles.statValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {formatCurrency(totalSpending, totalSpending >= 10000000)}
                    </Text>
                    <Caption style={styles.statSubtext}>
                      {totalReceipts} receipt{totalReceipts !== 1 ? 's' : ''}
                    </Caption>
                  </LinearGradient>
                </View>

                <View style={styles.statCardWrapper}>
                  <LinearGradient
                    colors={["#06b6d4", "#0891b2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}
                  >
                    <View style={styles.statIconContainer}>
                      <Text style={styles.statIcon}>🏆</Text>
                    </View>
                    <Caption style={[styles.statLabel, { color: "#cffafe" }]}>Top Category</Caption>
                    <Text
                      style={[styles.statValue, { fontSize: 20 }]}
                      numberOfLines={1}
                    >
                      {topCategory ? getCategoryLabel(topCategory.category) : "N/A"}
                    </Text>
                    <Caption style={[styles.statSubtext, { color: "#cffafe" }]}>
                      {topCategory ? formatCurrency(topCategory.total, true) : "₹0.00"}
                    </Caption>
                  </LinearGradient>
                </View>
              </View>

              {/* Pie Chart Card */}
              <GlassCard isDark={isDark} style={styles.chartCard}>
                <Subtitle style={{ marginBottom: spacing.sm }}>Spending Distribution</Subtitle>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieData}
                    donut
                    showText
                    textColor={isDark ? "white" : "black"}
                    radius={isSmallDevice ? 90 : 110}
                    innerRadius={isSmallDevice ? 45 : 55}
                    textSize={9}
                    focusOnPress
                    showValuesAsLabels={false}
                  />
                </View>
              </GlassCard>

              <GlassCard isDark={isDark} style={styles.chartCard}>
                <Subtitle style={{ marginBottom: spacing.sm }}>Top 5 Categories</Subtitle>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={barData}
                    barWidth={isSmallDevice ? 28 : 36}
                    noOfSections={4}
                    barBorderRadius={6}
                    frontColor="#6366f1"
                    yAxisThickness={0}
                    xAxisThickness={0}
                    hideRules
                    isAnimated
                    animationDuration={600}
                    width={isSmallDevice ? wp(75) : wp(80)}
                    height={180}
                    spacing={isSmallDevice ? 12 : 20}
                    xAxisLabelTextStyle={{
                      color: isDark ? '#9ca3af' : 'gray',
                      fontSize: 10,
                      width: 50,
                      textAlign: 'center'
                    }}
                    maxValue={maxBarValue * 1.2}
                  />
                </View>
              </GlassCard>

              {/* All Categories List */}
              <Subtitle style={{ marginBottom: spacing.sm, marginTop: spacing.sm }}>
                All Categories
              </Subtitle>

              {categoryData.map((item, index) => (
                <CategoryRow key={item.category || index} item={item} isDark={isDark} />
              ))}
            </>
          )}
        </Animated.ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  dateRangeWrapper: {
    marginBottom: spacing.md,
  },
  dateRangeContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  dateRangeButtonActive: {
    backgroundColor: "#6366f1",
  },
  dateRangeText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
  },
  customDateContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  customDateButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    padding: spacing.md,
  },
  statCardsContainer: {
    flexDirection: isSmallDevice ? "column" : "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCardWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  statCard: {
    padding: spacing.md,
    minHeight: 130,
    justifyContent: 'flex-start',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    color: "#e9d5ff",
    marginTop: 4,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
  },
  statSubtext: {
    color: "#e9d5ff",
    marginTop: 2,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: "center",
    width: "100%",
    paddingVertical: spacing.sm,
  },
  categoryRowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: spacing.sm,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "right",
  },
});

export default AnalyticsScreen;
