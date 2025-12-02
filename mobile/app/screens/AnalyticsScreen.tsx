import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, BarChart } from "react-native-gifted-charts";

import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import { Card } from "../components/ui/Card";
import { wp, hp, spacing, isSmallDevice, rfs } from "../utils/responsive";
import { getSpendingByCategory } from "../api/receipts";

type DateRange = "week" | "month" | "year";

const AnalyticsScreen = () => {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      let startDate = new Date();

      if (dateRange === "week") startDate = new Date(now.getTime() - 7 * 86400000);
      if (dateRange === "month") startDate = new Date(now.getTime() - 30 * 86400000);
      if (dateRange === "year") startDate = new Date(now.getTime() - 365 * 86400000);

      const data = await getSpendingByCategory(
        startDate.toISOString().split("T")[0],
        now.toISOString().split("T")[0]
      );

      setCategoryData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) =>
  ({
    grocery: "#4CAF50",
    restaurant: "#FF9800",
    petrol: "#2196F3",
    pharmacy: "#E91E63",
    electronics: "#9C27B0",
    food_delivery: "#FF5722",
    parking: "#607D8B",
    toll: "#795548",
    general: "#757575",
  }[category] || "#757575");

  const getCategoryLabel = (category: string) =>
  ({
    grocery: "Grocery",
    restaurant: "Restaurant",
    petrol: "Petrol/Fuel",
    pharmacy: "Pharmacy",
    electronics: "Electronics",
    food_delivery: "Food Delivery",
    parking: "Parking",
    toll: "Toll",
    general: "General",
  }[category] || category);

  const totalSpending = categoryData.reduce((s, i) => s + i.total, 0);
  const totalReceipts = categoryData.reduce((s, i) => s + i.count, 0);
  const topCategory = categoryData[0] || null;

  const pieData = categoryData.map(item => ({
    value: item.total,
    color: getCategoryColor(item.category),
    text: `₹${item.total.toFixed(0)}`,
    shiftTextX: -10,
    shiftTextY: -10,
  }));

  const barData = categoryData.slice(0, 5).map(item => ({
    value: item.total,
    label: getCategoryLabel(item.category).slice(0, 8),
    frontColor: '#6366f1',
    topLabelComponent: () => (
      <Text style={{ color: '#6366f1', fontSize: 10, marginBottom: 4 }}>
        ₹${item.total.toFixed(0)}
      </Text>
    ),
  }));

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ width: "100%", flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
            <View style={{ marginBottom: spacing.md }}>
              <Title>Analytics</Title>
              <Body>Track your spending patterns</Body>
            </View>

            <View style={{ marginBottom: spacing.md }}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: 4,
                }}
              >
                {(["week", "month", "year"] as DateRange[]).map((range) => (
                  <TouchableOpacity
                    key={range}
                    onPress={() => setDateRange(range)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: dateRange === range ? "#6366f1" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#fff",
                        fontWeight: dateRange === range ? "600" : "400",
                      }}
                    >
                      Last{" "}
                      {range === "week"
                        ? "7 Days"
                        : range === "month"
                          ? "30 Days"
                          : "Year"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {loading && (
              <View style={{ padding: spacing.xl, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
            )}

            {error && (
              <Card>
                <Body className="text-center text-red-500">{error}</Body>
              </Card>
            )}

            {/* EMPTY */}
            {!loading && !error && categoryData.length === 0 && (
              <Card>
                <Body className="text-center text-gray-400">
                  No spending data for this period
                </Body>
              </Card>
            )}

            {!loading && !error && categoryData.length > 0 && (
              <>
                <View
                  style={{
                    marginBottom: spacing.md,
                    flexDirection: isSmallDevice ? "column" : "row",
                    gap: spacing.sm,
                  }}
                >
                  <LinearGradient
                    colors={["#8b5cf6", "#7c3aed"]}
                    style={{
                      flex: 1,
                      borderRadius: spacing.md,
                      padding: spacing.md,
                      minHeight: hp(100),
                    }}
                  >
                    <Caption style={{ color: "#e9d5ff" }}>Total Spending</Caption>
                    <Title style={{ color: "#fff" }}>₹{totalSpending.toFixed(2)}</Title>
                    <Caption style={{ color: "#e9d5ff", marginTop: 4 }}>
                      {totalReceipts} receipts
                    </Caption>
                  </LinearGradient>

                  <LinearGradient
                    colors={["#06b6d4", "#0891b2"]}
                    style={{
                      flex: 1,
                      borderRadius: spacing.md,
                      padding: spacing.md,
                      minHeight: hp(100),
                    }}
                  >
                    <Caption style={{ color: "#cffafe" }}>Top Category</Caption>
                    <Title style={{ color: "#fff" }}>
                      {topCategory ? getCategoryLabel(topCategory.category) : "N/A"}
                    </Title>
                    <Caption style={{ color: "#cffafe", marginTop: 4 }}>
                      ₹{topCategory?.total?.toFixed(2) || "0.00"}
                    </Caption>
                  </LinearGradient>
                </View>

                <Card style={{ marginBottom: spacing.md }}>
                  <Subtitle>Spending Distribution</Subtitle>
                  <View style={{ alignItems: "center", width: "100%", paddingVertical: 10 }}>
                    <PieChart
                      data={pieData}
                      donut
                      showText
                      textColor="black"
                      radius={isSmallDevice ? 100 : 120}
                      innerRadius={isSmallDevice ? 50 : 60}
                      textSize={10}
                      focusOnPress
                      showValuesAsLabels={false}
                    />
                  </View>
                </Card>

                <Card style={{ marginBottom: spacing.md }}>
                  <Subtitle>Top 5 Categories</Subtitle>
                  <View style={{ alignItems: "center", width: "100%", paddingVertical: 10 }}>
                    <BarChart
                      data={barData}
                      barWidth={isSmallDevice ? 20 : 30}
                      noOfSections={4}
                      barBorderRadius={4}
                      frontColor="#6366f1"
                      yAxisThickness={0}
                      xAxisThickness={0}
                      hideRules
                      isAnimated
                      width={isSmallDevice ? 250 : 300}
                      height={200}
                      labelWidth={40}
                      xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                    />
                  </View>
                </Card>

                <Subtitle>All Categories</Subtitle>
                {categoryData.map((item, index) => (
                  <Card key={index} style={{ marginBottom: spacing.sm }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View
                          style={{
                            width: wp(40),
                            height: wp(40),
                            borderRadius: spacing.sm,
                            backgroundColor: getCategoryColor(item.category),
                            marginRight: spacing.sm
                          }}
                        />
                        <View>
                          <Subtitle>{getCategoryLabel(item.category)}</Subtitle>
                          <Caption>{item.count} receipts</Caption>
                        </View>
                      </View>
                      <Title>₹{item.total.toFixed(2)}</Title>
                    </View>
                  </Card>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default AnalyticsScreen;
