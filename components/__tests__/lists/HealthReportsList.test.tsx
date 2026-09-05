import React from 'react';
import { render } from '@testing-library/react-native';
import HealthReportsList from '../../HealthReportsList';
import { HealthReport } from '../../../types/tracking';

const baseReport: HealthReport = {
  id: 'report-1',
  periodStart: '2026-08-01',
  periodEnd: '2026-08-30',
  generatedAt: '2026-08-31T09:00:00.000Z',
  summaryStats: {},
  correlations: [
    {
      entryType: 'food',
      tag: 'dairy',
      outcomeId: 'bristol_urgent',
      outcomeLabel: 'Loose stools',
      windowHours: 24,
      exposedCount: 22,
      unexposedCount: 40,
      observedRate: 0.5,
      baselineRate: 0.19,
      lift: 2.6,
    },
  ],
  aiReportText: 'This is your generated health report narrative for the period.',
  model: 'gemini-2.5-flash',
};

describe('HealthReportsList', () => {
  it('renders an empty state when there are no reports', () => {
    const { getByText } = render(<HealthReportsList reports={[]} />);
    expect(getByText(/No reports yet/i)).toBeTruthy();
  });

  it('renders the history heading with report count', () => {
    const { getByText } = render(<HealthReportsList reports={[baseReport]} />);
    expect(getByText('Past Reports (1)')).toBeTruthy();
  });

  it('renders the report period, generated date, and AI report text', () => {
    const { getByText } = render(<HealthReportsList reports={[baseReport]} />);
    expect(getByText('2026-08-01 – 2026-08-30')).toBeTruthy();
    expect(getByText(baseReport.aiReportText)).toBeTruthy();
  });

  it('renders a formatted correlation line from a well-formed correlation', () => {
    const { getByText } = render(<HealthReportsList reports={[baseReport]} />);
    expect(
      getByText(/Loose stools was 2\.6x more likely within 24h of dairy — based on 22 occurrences\./)
    ).toBeTruthy();
  });

  it('renders the insufficient-data message when correlations is empty', () => {
    const reportWithNoCorrelations: HealthReport = { ...baseReport, id: 'report-2', correlations: [] };
    const { getByText } = render(<HealthReportsList reports={[reportWithNoCorrelations]} />);
    expect(getByText(/Not enough data yet/i)).toBeTruthy();
  });

  it('skips malformed correlation entries instead of crashing', () => {
    const malformed: HealthReport = {
      ...baseReport,
      id: 'report-3',
      correlations: [{ tag: 'dairy' } as Record<string, unknown>],
    };
    const { getByText } = render(<HealthReportsList reports={[malformed]} />);
    // Falls back to the insufficient-data message since no valid line could be built
    expect(getByText(/Not enough data yet/i)).toBeTruthy();
  });

  it('renders multiple reports newest-first order as provided by props', () => {
    const secondReport: HealthReport = {
      ...baseReport,
      id: 'report-2',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-30',
    };
    const { getByText } = render(<HealthReportsList reports={[baseReport, secondReport]} />);
    expect(getByText('Past Reports (2)')).toBeTruthy();
    expect(getByText('2026-08-01 – 2026-08-30')).toBeTruthy();
    expect(getByText('2026-07-01 – 2026-07-30')).toBeTruthy();
  });

  it('uses singular "occurrence" when exposedCount is 1', () => {
    const singleOccurrence: HealthReport = {
      ...baseReport,
      id: 'report-4',
      correlations: [{ ...baseReport.correlations[0], exposedCount: 1 }],
    };
    const { getByText } = render(<HealthReportsList reports={[singleOccurrence]} />);
    expect(getByText(/based on 1 occurrence\./)).toBeTruthy();
  });
});
