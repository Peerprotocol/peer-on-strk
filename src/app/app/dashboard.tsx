import { InfoIcon } from 'lucide-react';

const Dashboard = () => {
    const metricsData = [
        {
            label: "Total Value Locked",
            value: "$20.04M",
            showInfo: true
        },
        {
            label: "Total Lend Value",
            value: "$13.308M",
            showInfo: false
        },
        {
            label: "Total Borrow Value",
            value: "$6.680M",
            showInfo: false
        },
        {
            label: "Active P2P Deals",
            value: "3536",
            showInfo: false
        },
        {
            label: "Completed P2P deals",
            value: "856",
            showInfo: false
        },
        {
            label: "Total Interest Paid",
            value: "$142.05K",
            showInfo: true
        }
    ];

    const MetricCard = ({ label, value, showInfo } : {label: any, value: any, showInfo: any}) => (
        <div className="relative bg-smoke-white py-14 px-4 border rounded-lg">
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="text-black font-semibold text-2xl md:text-4xl pt-2">{value}</p>
            {showInfo && (
                <InfoIcon 
                    className="cursor-pointer absolute top-3 right-3 w-5 h-5 text-gray-500"
                />
            )}
        </div>
    );

    return ( 
        <div className="bg-white border rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10 py-5 px-5">
            {metricsData.map((metric, index) => (
                <MetricCard
                    key={index}
                    label={metric.label}
                    value={metric.value}
                    showInfo={metric.showInfo}
                />
            ))}
        </div>
    );
};

export default Dashboard;