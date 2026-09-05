import { StyleSheet } from 'react-native';

export const statsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 16,
  },

  // Period selector
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  periodButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#e8f0ff',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#007bff',
  },

  // Summary pills row
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#687076',
    marginTop: 2,
    textAlign: 'center',
  },

  // Section card
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 12,
  },

  // Chart legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  legendLine: {
    width: 16,
    height: 2,
    backgroundColor: '#B8CCE8',
    marginLeft: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#687076',
  },

  // Macro bars
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    width: 52,
  },
  macroBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    width: 72,
    textAlign: 'right',
  },
  macroGoal: {
    fontWeight: '400',
    color: '#888',
  },

  // Empty / hint
  emptyText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },

  // Bowel section
  bowelSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subsectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bristolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bristolTypeLabel: {
    fontSize: 12,
    color: '#555',
    width: 48,
  },
  bristolBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bristolBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  bristolCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    width: 20,
    textAlign: 'right',
  },

  // Health report generator
  reportGeneratorContainer: {
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
