import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Example datasets for different time periods
const data1Day = [
    { name: '12 AM', borrow: 500, lend: 400, openDeals: 300, completedDeals: 200 },
    { name: '6 AM', borrow: 600, lend: 500, openDeals: 400, completedDeals: 300 },
    { name: '12 PM', borrow: 700, lend: 600, openDeals: 500, completedDeals: 400 },
    { name: '6 PM', borrow: 800, lend: 700, openDeals: 600, completedDeals: 500 },
];

const data1Week = [
    { name: 'Mon', borrow: 3000, lend: 2400, openDeals: 2200, completedDeals: 1800 },
    { name: 'Tue', borrow: 3500, lend: 2600, openDeals: 2400, completedDeals: 2000 },
    { name: 'Wed', borrow: 3700, lend: 2900, openDeals: 2700, completedDeals: 2100 },
    { name: 'Thu', borrow: 3400, lend: 2800, openDeals: 2600, completedDeals: 2300 },
    { name: 'Fri', borrow: 3300, lend: 2700, openDeals: 2500, completedDeals: 2200 },
    { name: 'Sat', borrow: 3600, lend: 2900, openDeals: 2700, completedDeals: 2400 },
    { name: 'Sun', borrow: 3800, lend: 3000, openDeals: 2900, completedDeals: 2500 },
];

const data1Month = [
    { name: 'Week 1', borrow: 10000, lend: 8000, openDeals: 7000, completedDeals: 6000 },
    { name: 'Week 2', borrow: 12000, lend: 9000, openDeals: 8000, completedDeals: 7000 },
    { name: 'Week 3', borrow: 13000, lend: 10000, openDeals: 9000, completedDeals: 8000 },
    { name: 'Week 4', borrow: 14000, lend: 11000, openDeals: 10000, completedDeals: 9000 },
];

const dataMax = [
    { name: '2020', borrow: 20000, lend: 15000, openDeals: 14000, completedDeals: 12000 },
    { name: '2021', borrow: 30000, lend: 25000, openDeals: 22000, completedDeals: 21000 },
    { name: '2022', borrow: 40000, lend: 35000, openDeals: 32000, completedDeals: 30000 },
    { name: '2023', borrow: 50000, lend: 45000, openDeals: 42000, completedDeals: 40000 },
];

const AnalyticsChart = () => {
    // State to manage visibility of each dataset
    const [showBorrow, setShowBorrow] = useState(true);
    const [showLend, setShowLend] = useState(true);
    const [showOpenDeals, setShowOpenDeals] = useState(true);
    const [showCompletedDeals, setShowCompletedDeals] = useState(true);

    // State to manage selected time period
    const [timePeriod, setTimePeriod] = useState('1 day');
    const [chartData, setChartData] = useState(data1Day); // Default dataset

    // Handle change for the time period dropdown
    const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPeriod = event.target.value;
        setTimePeriod(selectedPeriod);

        // Update chart data based on the selected time period
        switch (selectedPeriod) {
            case '1 day':
                setChartData(data1Day);
                break;
            case '1 week':
                setChartData(data1Week);
                break;
            case '1 month':
                setChartData(data1Month);
                break;
            case 'max':
                setChartData(dataMax);
                break;
            default:
                setChartData(data1Day);
                break;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md mx-4 md:mx-8 text-black relative py-8 px-2 md:px-4">
            {/* Header with title and dropdown */}
            <div className="px-8 flex justify-between items-center">
                <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
                {/* Dropdown to select time period */}
                <select
                    className="bg-white border border-gray-300 rounded-full p-2 focus:outline-none focus:ring-0 focus:border-gray-300"
                    value={timePeriod}
                    onChange={handleTimePeriodChange}
                >
                    <option value="1 day">1 Day</option>
                    <option value="1 week">1 Week</option>
                    <option value="1 month">1 Month</option>
                    <option value="6 months">6 Months</option>
                    <option value="1 year">1 Year</option>
                    <option value="max">Max</option>
                </select>

            </div>

            {/* Chart */}
            <div className="w-full h-[65vh]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        {/* Conditional rendering of lines based on checkboxes */}
                        {showBorrow && <Line type="monotone" dataKey="borrow" stroke="#8884d8" />}
                        {showLend && <Line type="monotone" dataKey="lend" stroke="#82ca9d" />}
                        {showOpenDeals && <Line type="monotone" dataKey="openDeals" stroke="#ffc658" />}
                        {showCompletedDeals && <Line type="monotone" dataKey="completedDeals" stroke="#ff7300" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {/* Checkboxes to toggle data visibility */}
            <div className="md:px-8 px-2 mb-4 flex flex-wrap md:flex-row gap-4 md:gap-32 justify-center">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showBorrow}
                        onChange={() => setShowBorrow(!showBorrow)}
                    />
                    <span className="ml-2">Borrow</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showLend}
                        onChange={() => setShowLend(!showLend)}
                    />
                    <span className="ml-2">Lend</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showOpenDeals}
                        onChange={() => setShowOpenDeals(!showOpenDeals)}
                    />
                    <span className="ml-2">Open Deals</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showCompletedDeals}
                        onChange={() => setShowCompletedDeals(!showCompletedDeals)}
                    />
                    <span className="ml-2">Completed Deals</span>
                </label>
            </div>
        </div>
    );
};

export default AnalyticsChart;
