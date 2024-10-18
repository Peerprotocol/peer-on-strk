export interface DashboardData {
    label: string;
    value: string;
    info?: string; // Optional for the info icon if needed
}

export const dashboardItems: DashboardData[] = [
    // { label: 'Net Value', value: '$1900.01', info: 'Information about Net Value' },
    { label: 'Available Balance', value: '$1200.34', info: 'Information about Available Balance' },
    { label: 'Total Lend', value: '$1500.50', info: 'Information about Total Lend' },
    { label: 'Total Borrow', value: '$900.00', info: 'Information about Total Borrow' },
    { label: 'Interest Earned', value: '$250.12', info: 'Information about Interest Earned' },
];
