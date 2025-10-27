import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 10,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  calorieValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 5,
  },
  calorieValue: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    flex: 1,
  },
});