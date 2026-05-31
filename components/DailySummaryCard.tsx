/**
 * DailySummaryCard — today's calorie and macro progress.
 * Reads food entries and goals from TrackingContext; does its own date
 * filtering so it stays in sync with any new entries added during the session.
 * Only renders when the user has logged at least one food entry today OR
 * has a calorie goal set.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTracking } from '../hooks/TrackingContext';
import { isSameDay } from '../utils/dateUtils';

type MacroBarProps = {
  label: string;
  consumed: number;
  goal?: number;
  unit: string;
  color: string;
};

function MacroBar({ label, consumed, goal, unit, color }: MacroBarProps) {
  const pct = goal && goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const hasGoal = goal !== undefined && goal > 0;
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>
        {Math.round(consumed)}{unit}
        {hasGoal ? ` / ${Math.round(goal!)}${unit}` : ''}
      </Text>
    </View>
  );
}

export default function DailySummaryCard() {
  const { data, userProfile } = useTracking();
  const today = new Date();

  const todayTotals = useMemo(() => {
    const todayEntries = data.foodEntries.filter((e) =>
      isSameDay(new Date(e.timestamp), today)
    );
    return todayEntries.reduce(
      (acc, e) => ({
        calories: acc.calories + (e.totalCalories ?? 0),
        protein:  acc.protein  + (e.totalProtein  ?? 0),
        carbs:    acc.carbs    + (e.totalCarbs    ?? 0),
        fat:      acc.fat      + (e.totalFat      ?? 0),
        entryCount: acc.entryCount + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, entryCount: 0 },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.foodEntries]);

  const hasGoal = !!userProfile.dailyCalorieGoal;
  const hasMacroGoals =
    !!userProfile.dailyProteinGoal ||
    !!userProfile.dailyCarbGoal ||
    !!userProfile.dailyFatGoal;
  const hasData = todayTotals.entryCount > 0;

  // Nothing to show when the user has no entries and no goals configured
  if (!hasData && !hasGoal) return null;

  const calGoal = userProfile.dailyCalorieGoal;
  const calPct = calGoal && calGoal > 0
    ? Math.min(todayTotals.calories / calGoal, 1)
    : 0;
  const remaining = calGoal ? Math.max(calGoal - todayTotals.calories, 0) : null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Today</Text>

      {/* Calorie ring summary */}
      <View style={styles.calorieRow}>
        <View style={styles.calorieNumbers}>
          <Text style={styles.calorieConsumed}>
            {Math.round(todayTotals.calories)}
          </Text>
          <Text style={styles.calorieUnit}> kcal</Text>
          {hasGoal && remaining !== null && (
            <Text style={styles.calorieRemaining}>
              {' '}· {Math.round(remaining)} remaining
            </Text>
          )}
        </View>
        {hasGoal && calGoal && calGoal > 0 && (
          <View style={styles.calProgressTrack}>
            <View
              style={[
                styles.calProgressFill,
                {
                  width: `${calPct * 100}%` as any,
                  backgroundColor: calPct >= 1 ? '#DC267F' : '#0a7ea4',
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Macro bars — shown only if any macro data or goals exist */}
      {(hasData || hasMacroGoals) && (
        <View style={styles.macros}>
          <MacroBar
            label="Protein"
            consumed={todayTotals.protein}
            goal={userProfile.dailyProteinGoal}
            unit="g"
            color="#648FFF"
          />
          <MacroBar
            label="Carbs"
            consumed={todayTotals.carbs}
            goal={userProfile.dailyCarbGoal}
            unit="g"
            color="#FFB000"
          />
          <MacroBar
            label="Fat"
            consumed={todayTotals.fat}
            goal={userProfile.dailyFatGoal}
            unit="g"
            color="#FE6100"
          />
        </View>
      )}

      {hasData && (
        <Text style={styles.entryCount}>
          {todayTotals.entryCount} meal{todayTotals.entryCount !== 1 ? 's' : ''} logged today
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687076',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  calorieRow: {
    marginBottom: 12,
  },
  calorieNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  calorieConsumed: {
    fontSize: 28,
    fontWeight: '700',
    color: '#11181C',
  },
  calorieUnit: {
    fontSize: 14,
    color: '#687076',
  },
  calorieRemaining: {
    fontSize: 13,
    color: '#687076',
  },
  calProgressTrack: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  calProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macros: {
    gap: 8,
    marginBottom: 10,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroLabel: {
    width: 52,
    fontSize: 12,
    color: '#687076',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValue: {
    width: 90,
    fontSize: 11,
    color: '#687076',
    textAlign: 'right',
  },
  entryCount: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 4,
  },
});
