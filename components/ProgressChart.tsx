import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Canvas, Line, Circle } from '@shopify/react-native-skia';
import { FoodEntry, WaterEntry } from '@/types/tracking';
import { styles } from '@/styles/progressChart.styles';

interface ProgressChartProps {
  foodEntries: FoodEntry[];
  waterEntries: WaterEntry[];
}

export default function ProgressChart({ foodEntries, waterEntries }: ProgressChartProps) {
  const { width } = Dimensions.get('window');

  // Calculate daily calorie totals for the last 7 days
  const getDailyCalories = () => {
    const dailyTotals: number[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));
      
      const dayTotal = foodEntries
        .filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= dayStart && entryDate <= dayEnd;
        })
        .reduce((total, entry) => total + (entry.totalCalories || 0), 0);
      
      dailyTotals.push(dayTotal);
    }
    
    return dailyTotals;
  };

  // Calculate daily water volume totals for the last 7 days
  const getDailyWaterVolume = () => {
    const dailyTotals: number[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));
      
      const dayTotal = waterEntries
        .filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= dayStart && entryDate <= dayEnd;
        })
        .reduce((total, entry) => total + (entry.totalVolume || 0), 0);
      
      dailyTotals.push(dayTotal);
    }
    
    return dailyTotals;
  };

  const getDayLabels = () => {
    const labels: string[] = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(days[targetDate.getDay()]);
    }
    
    return labels;
  };

  const chartData = getDailyCalories();
  const waterData = getDailyWaterVolume();
  const dayLabels = getDayLabels();
  const chartHeight = 200;
  const chartWidth = width - 40;
  const maxCalorieValue = Math.max(...chartData, 1); // Ensure at least 1 to avoid division by 0
  const maxWaterValue = Math.max(...waterData, 1); // Ensure at least 1 to avoid division by 0
  const padding = 30;

  return (
    <View>
      <Text style={styles.chartSubtitle}>Daily Progress (Last 7 Days)</Text>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#007bff' }]} />
          <Text style={styles.legendText}>Calories</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#17a2b8' }]} />
          <Text style={styles.legendText}>Water (ml)</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Canvas style={{ width: chartWidth, height: chartHeight + padding * 2 }}>
          {/* Draw calorie line chart */}
          {chartData.map((value, index) => {
            if (index === 0) return null; // Skip first point for line drawing
            
            const prevValue = chartData[index - 1];
            const x1 = padding + ((index - 1) * (chartWidth - padding * 2)) / (chartData.length - 1);
            const y1 = chartHeight + padding - (prevValue / maxCalorieValue) * chartHeight;
            const x2 = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
            const y2 = chartHeight + padding - (value / maxCalorieValue) * chartHeight;
            
            return (
              <Line
                key={`calorie-line-${index}`}
                p1={{ x: x1, y: y1 }}
                p2={{ x: x2, y: y2 }}
                color="#007bff"
                style="stroke"
                strokeWidth={3}
              />
            );
          })}
          
          {/* Draw water line chart */}
          {waterData.map((value, index) => {
            if (index === 0) return null; // Skip first point for line drawing
            
            const prevValue = waterData[index - 1];
            const x1 = padding + ((index - 1) * (chartWidth - padding * 2)) / (chartData.length - 1);
            const y1 = chartHeight + padding - (prevValue / maxWaterValue) * chartHeight;
            const x2 = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
            const y2 = chartHeight + padding - (value / maxWaterValue) * chartHeight;
            
            return (
              <Line
                key={`water-line-${index}`}
                p1={{ x: x1, y: y1 }}
                p2={{ x: x2, y: y2 }}
                color="#17a2b8"
                style="stroke"
                strokeWidth={3}
              />
            );
          })}
          
          {/* Draw calorie data points */}
          {chartData.map((value, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
            const y = chartHeight + padding - (value / maxCalorieValue) * chartHeight;
            
            return (
              <Circle
                key={`calorie-point-${index}`}
                cx={x}
                cy={y}
                r={6}
                color="#007bff"
              />
            );
          })}
          
          {/* Draw water data points */}
          {waterData.map((value, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (chartData.length - 1);
            const y = chartHeight + padding - (value / maxWaterValue) * chartHeight;
            
            return (
              <Circle
                key={`water-point-${index}`}
                cx={x}
                cy={y}
                r={6}
                color="#17a2b8"
              />
            );
          })}
        </Canvas>
        
        {/* Day labels */}
        <View style={styles.chartLabels}>
          {dayLabels.map((label, index) => (
            <Text key={`label-${index}`} style={styles.dayLabel}>
              {label}
            </Text>
          ))}
        </View>
        
        {/* Display calorie values */}
        <View style={styles.calorieValues}>
          {chartData.map((value, index) => (
            <Text key={`value-${index}`} style={styles.calorieValue}>
              {Math.round(value)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}