import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Canvas, Rect, Line } from '@shopify/react-native-skia';
import { useTracking } from '@/hooks/TrackingContext';
import { BristolType } from '@/types/tracking';
import { statsStyles as styles } from '@/styles/stats.styles';
import { buildDateRange, aggregateDailyStats } from '@/lib/insightsEngine';

type Period = 7 | 30;

const BRISTOL_COLORS: Record<BristolType, string> = {
  1: '#dc2626',
  2: '#ea580c',
  3: '#d97706',
  4: '#16a34a',
  5: '#65a30d',
  6: '#ca8a04',
  7: '#dc2626',
};

const SHORT_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ── Bar chart (Skia) ─────────────────────────────────────────────────────────

interface BarChartProps {
  values: number[];
  goal?: number;
  barColor: string;
  goalColor: string;
  canvasWidth: number;
  canvasHeight: number;
}

function BarChart({ values, goal, barColor, goalColor, canvasWidth, canvasHeight }: BarChartProps) {
  const PAD_TOP = 8;
  const PAD_BOTTOM = 4;
  const PAD_H = 4;
  const chartH = canvasHeight - PAD_TOP - PAD_BOTTOM;
  const chartW = canvasWidth - PAD_H * 2;
  const n = values.length;
  const maxVal = Math.max(...values, goal ?? 0, 1);
  const slotW = chartW / n;
  const barW = Math.max(slotW * 0.6, 2);

  const toY = (v: number) => PAD_TOP + chartH - (v / maxVal) * chartH;
  const goalY = goal != null && goal > 0 ? toY(goal) : null;

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      {values.map((v, i) => {
        if (v <= 0) return null;
        const barH = (v / maxVal) * chartH;
        const x = PAD_H + i * slotW + (slotW - barW) / 2;
        const y = toY(v);
        return <Rect key={i} x={x} y={y} width={barW} height={barH} color={barColor} />;
      })}
      {goalY != null && (
        <Line
          p1={{ x: PAD_H, y: goalY }}
          p2={{ x: PAD_H + chartW, y: goalY }}
          color={goalColor}
          strokeWidth={1.5}
        />
      )}
    </Canvas>
  );
}

// ── Day-label row below a chart ───────────────────────────────────────────────

function DayLabels({ dates, canvasWidth, period }: { dates: Date[]; canvasWidth: number; period: Period }) {
  const n = dates.length;
  const slotW = canvasWidth / n;
  const step = period === 7 ? 1 : Math.ceil(n / 6);

  return (
    <View style={{ flexDirection: 'row', width: canvasWidth, paddingHorizontal: 4 }}>
      {dates.map((d, i) => {
        const show = i % step === 0 || i === n - 1;
        return (
          <View key={i} style={{ width: slotW, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#888' }}>
              {show ? (period === 7 ? SHORT_DAYS[d.getDay()] : String(d.getDate())) : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Horizontal macro bar ──────────────────────────────────────────────────────

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal?: number; color: string }) {
  const pct = goal && goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>
        {Math.round(value)}g
        {goal ? <Text style={styles.macroGoal}>/{Math.round(goal)}g</Text> : null}
      </Text>
    </View>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const { data, userProfile } = useTracking();
  const { width: screenWidth } = useWindowDimensions();
  const [period, setPeriod] = useState<Period>(7);

  const canvasWidth = screenWidth - 32;
  const dates = useMemo(() => buildDateRange(period), [period]);

  const {
    dailyCalories,
    avgCalories,
    dailyWater,
    avgWater,
    macroAvgs,
    bowelInPeriod,
    bristolDist,
    avgBristol,
  } = useMemo(() => aggregateDailyStats(dates, data), [dates, data]);

  const hasMacros = macroAvgs.protein > 0 || macroAvgs.carbs > 0 || macroAvgs.fat > 0;
  const hasMacroGoals =
    userProfile?.dailyProteinGoal || userProfile?.dailyCarbGoal || userProfile?.dailyFatGoal;

  const maxBristolCount = Math.max(...Object.values(bristolDist), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Stats</Text>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {([7, 30] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
              {p} Days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>{avgCalories > 0 ? avgCalories.toLocaleString() : '—'}</Text>
          <Text style={styles.summaryLabel}>Avg kcal/day</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>{avgWater > 0 ? avgWater : '—'}</Text>
          <Text style={styles.summaryLabel}>Avg ml/day</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>{bowelInPeriod.length || '—'}</Text>
          <Text style={styles.summaryLabel}>Bowel entries</Text>
        </View>
      </View>

      {/* Calories chart */}
      <SectionCard title="Daily Calories">
        <BarChart
          values={dailyCalories}
          goal={userProfile?.dailyCalorieGoal}
          barColor="#007bff"
          goalColor="#B8CCE8"
          canvasWidth={canvasWidth}
          canvasHeight={140}
        />
        <DayLabels dates={dates} canvasWidth={canvasWidth} period={period} />
        <View style={styles.legendRow}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Calories</Text>
          {userProfile?.dailyCalorieGoal ? (
            <>
              <View style={styles.legendLine} />
              <Text style={styles.legendText}>Goal ({userProfile.dailyCalorieGoal} kcal)</Text>
            </>
          ) : null}
        </View>
      </SectionCard>

      {/* Water chart */}
      <SectionCard title="Daily Water Intake">
        <BarChart
          values={dailyWater}
          goal={userProfile?.dailyWaterGoalMl}
          barColor="#17a2b8"
          goalColor="#B8CCE8"
          canvasWidth={canvasWidth}
          canvasHeight={140}
        />
        <DayLabels dates={dates} canvasWidth={canvasWidth} period={period} />
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#17a2b8' }]} />
          <Text style={styles.legendText}>Water (ml)</Text>
          {userProfile?.dailyWaterGoalMl ? (
            <>
              <View style={styles.legendLine} />
              <Text style={styles.legendText}>Goal ({userProfile.dailyWaterGoalMl} ml)</Text>
            </>
          ) : null}
        </View>
      </SectionCard>

      {/* Macro averages */}
      <SectionCard title="Average Macros (per day)">
        {hasMacros ? (
          <>
            <MacroBar label="Protein" value={macroAvgs.protein} goal={userProfile?.dailyProteinGoal} color="#f59e0b" />
            <MacroBar label="Carbs" value={macroAvgs.carbs} goal={userProfile?.dailyCarbGoal} color="#10b981" />
            <MacroBar label="Fat" value={macroAvgs.fat} goal={userProfile?.dailyFatGoal} color="#ef4444" />
            {!hasMacroGoals && (
              <Text style={styles.hintText}>Set nutrition goals in your profile to see targets.</Text>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>No food data for this period.</Text>
        )}
      </SectionCard>

      {/* Bowel health — only shown when there are entries in the selected period */}
      {bowelInPeriod.length > 0 && (
        <SectionCard title="Bowel Health">
          <View style={styles.bowelSummaryRow}>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryValue}>{avgBristol != null ? avgBristol.toFixed(1) : '—'}</Text>
              <Text style={styles.summaryLabel}>Avg Bristol type</Text>
            </View>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryValue}>{bowelInPeriod.length}</Text>
              <Text style={styles.summaryLabel}>Total entries</Text>
            </View>
          </View>
          <Text style={styles.subsectionLabel}>Bristol Type Distribution</Text>
          {([1, 2, 3, 4, 5, 6, 7] as BristolType[]).map(type => {
            const count = bristolDist[type];
            const pct = count / maxBristolCount;
            return (
              <View key={type} style={styles.bristolRow}>
                <Text style={styles.bristolTypeLabel}>Type {type}</Text>
                <View style={styles.bristolBarTrack}>
                  <View
                    style={[
                      styles.bristolBarFill,
                      { width: `${pct * 100}%`, backgroundColor: BRISTOL_COLORS[type] },
                    ]}
                  />
                </View>
                <Text style={styles.bristolCount}>{count}</Text>
              </View>
            );
          })}
        </SectionCard>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
