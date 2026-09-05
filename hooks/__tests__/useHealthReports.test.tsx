import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useHealthReports } from '../useHealthReports';
import { HealthReport } from '../../types/tracking';
import * as trackingService from '../../lib/trackingService';

jest.spyOn(Alert, 'alert');

const mockReport: HealthReport = {
  id: 'report-1',
  periodStart: '2025-08-01',
  periodEnd: '2025-08-07',
  generatedAt: '2025-08-08T00:00:00.000Z',
  summaryStats: {},
  correlations: [],
  aiReportText: 'Test report text',
  model: 'gemini-2.5-flash',
};

const TestHealthReportsComponent = () => {
  const { reports, loading, generating, generateReport, refresh } = useHealthReports();

  return (
    <View>
      <Text testID="loading">{loading ? 'loading' : 'ready'}</Text>
      <Text testID="generating">{generating ? 'generating' : 'idle'}</Text>
      <Text testID="reports-count">{reports.length}</Text>
      <TouchableOpacity onPress={() => generateReport('2025-08-01', '2025-08-07')} testID="generate-button">
        <Text>Generate</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={refresh} testID="refresh-button">
        <Text>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('useHealthReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (trackingService.fetchHealthReports as jest.Mock).mockResolvedValue([]);
    (trackingService.generateHealthReport as jest.Mock).mockResolvedValue(mockReport);
  });

  it('fetches reports on mount', async () => {
    (trackingService.fetchHealthReports as jest.Mock).mockResolvedValue([mockReport]);

    const { getByTestId } = render(<TestHealthReportsComponent />);

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));
    expect(getByTestId('reports-count').props.children).toBe(1);
    expect(trackingService.fetchHealthReports).toHaveBeenCalledWith('test-user-id');
  });

  it('starts with loading state true then settles to ready', async () => {
    const { getByTestId } = render(<TestHealthReportsComponent />);

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));
  });

  it('generates a report and prepends it to the list', async () => {
    const { getByTestId } = render(<TestHealthReportsComponent />);

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    fireEvent.press(getByTestId('generate-button'));

    await waitFor(() => expect(getByTestId('generating').props.children).toBe('idle'));
    expect(getByTestId('reports-count').props.children).toBe(1);
    expect(trackingService.generateHealthReport).toHaveBeenCalledWith('2025-08-01', '2025-08-07');
  });

  it('sets generating state true while the report is being generated', async () => {
    let resolveGenerate: (value: HealthReport) => void = () => {};
    (trackingService.generateHealthReport as jest.Mock).mockReturnValue(
      new Promise((resolve) => { resolveGenerate = resolve; })
    );

    const { getByTestId } = render(<TestHealthReportsComponent />);
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    fireEvent.press(getByTestId('generate-button'));

    await waitFor(() => expect(getByTestId('generating').props.children).toBe('generating'));

    resolveGenerate(mockReport);

    await waitFor(() => expect(getByTestId('generating').props.children).toBe('idle'));
  });

  it('shows an alert and does not add a report when generation fails', async () => {
    (trackingService.generateHealthReport as jest.Mock).mockRejectedValue(new Error('Rate limit exceeded'));

    const { getByTestId } = render(<TestHealthReportsComponent />);
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    fireEvent.press(getByTestId('generate-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Report generation failed', 'Rate limit exceeded');
    });
    expect(getByTestId('reports-count').props.children).toBe(0);
    expect(getByTestId('generating').props.children).toBe('idle');
  });

  it('refresh re-fetches reports', async () => {
    const { getByTestId } = render(<TestHealthReportsComponent />);
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    (trackingService.fetchHealthReports as jest.Mock).mockResolvedValue([mockReport]);
    fireEvent.press(getByTestId('refresh-button'));

    await waitFor(() => expect(getByTestId('reports-count').props.children).toBe(1));
  });
});
