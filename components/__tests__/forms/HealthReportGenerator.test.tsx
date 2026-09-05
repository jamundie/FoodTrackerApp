import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HealthReportGenerator from '../../HealthReportGenerator';

describe('HealthReportGenerator', () => {
  it('renders the period options and defaults to 30 days selected', () => {
    const { getByTestId } = render(
      <HealthReportGenerator generating={false} onGenerate={jest.fn()} />
    );
    expect(getByTestId('report-period-7')).toBeTruthy();
    expect(getByTestId('report-period-30')).toBeTruthy();
    expect(getByTestId('report-period-90')).toBeTruthy();
  });

  it('calls onGenerate with computed periodStart/periodEnd when pressed', () => {
    const onGenerate = jest.fn();
    const { getByTestId } = render(
      <HealthReportGenerator generating={false} onGenerate={onGenerate} />
    );
    fireEvent.press(getByTestId('generate-report-button'));
    expect(onGenerate).toHaveBeenCalledTimes(1);
    const [periodStart, periodEnd] = onGenerate.mock.calls[0];
    expect(periodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(periodStart).getTime()).toBeLessThanOrEqual(new Date(periodEnd).getTime());
  });

  it('uses the selected period when computing the generated range', () => {
    const onGenerate = jest.fn();
    const { getByTestId } = render(
      <HealthReportGenerator generating={false} onGenerate={onGenerate} />
    );
    fireEvent.press(getByTestId('report-period-7'));
    fireEvent.press(getByTestId('generate-report-button'));

    const [periodStart, periodEnd] = onGenerate.mock.calls[0];
    const days =
      Math.round((new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / 86_400_000) + 1;
    expect(days).toBe(7);
  });

  it('shows a loading state and disables the button while generating', () => {
    const onGenerate = jest.fn();
    const { getByTestId, getByText } = render(
      <HealthReportGenerator generating={true} onGenerate={onGenerate} />
    );
    expect(getByText('Generating…')).toBeTruthy();
    expect(getByTestId('generate-report-button').props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(getByTestId('generate-report-button'));
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('shows the idle button label when not generating', () => {
    const { getByText, queryByText } = render(
      <HealthReportGenerator generating={false} onGenerate={jest.fn()} />
    );
    expect(getByText('Generate Report')).toBeTruthy();
    expect(queryByText('Generating…')).toBeNull();
  });
});
