import { StyleSheet } from 'react-native';

export const bowelStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff', // Soft purple tint for the bowel theme
  },

  // Bristol type selector
  bristolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  bristolButton: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bristolButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#ede9fe',
  },
  bristolButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
  },
  bristolButtonTextSelected: {
    color: '#7c3aed',
  },
  bristolDescription: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },

  // Urgency selector
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  urgencyButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#ede9fe',
  },
  urgencyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  urgencyButtonTextSelected: {
    color: '#7c3aed',
  },

  // Pain level slider row
  painRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  painLabel: {
    fontSize: 14,
    color: '#333',
    width: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  painButtonsRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  painButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  painButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#7c3aed',
  },
  painButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  painButtonTextSelected: {
    color: '#fff',
  },

  // Blood toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  toggleButtonActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  toggleButtonTextActive: {
    color: '#dc2626',
  },

  // Entry cards in the list
  entryCardType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
  },
  entryCardBlood: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
