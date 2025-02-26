'use client'
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
    const [protocolData, setProtocolData] = useState({
        total_value_locked: "0",
        total_lend: "0",
        total_borrow: "0",
        total_p2p_deals: "0",
        total_users: "0"
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProtocolData = async () => {
            try {
                const response = await fetch('/api/database/protocol-data');
                const usersResponse = await fetch('/api/database/get-users');
                const result = await response.json();
                const usersResult = await usersResponse.json();

                const totalUsers = usersResult.length;
                
                if (!result.success) {
                    throw new Error(result.message);
                }
                
                setProtocolData({...result.data, total_users: totalUsers});
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProtocolData();
    }, []);


    const formatCurrency = (value: any) => {
        const num = Number(value);
        if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`;
        } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(2)}K`;
        }
        return `$${num.toFixed(2)}`;
    };

    // Format numbers with commas
    const formatNumber = (value: any) => {
        return Number(value).toLocaleString();
    };

    const metricsData = [
        {
            label: "Total Value Locked",
            value: formatCurrency(protocolData.total_value_locked),
            showInfo: true
        },
        {
            label: "Total Lend Value",
            value: formatCurrency(protocolData.total_lend),
            showInfo: false
        },
        {
            label: "Total Borrow Value",
            value: formatCurrency(protocolData.total_borrow),
            showInfo: false
        },
        {
            label: "Total P2P Deals",
            value: formatNumber(protocolData.total_p2p_deals),
            showInfo: false
        },
        {
            label: "Total Users",
            value: formatNumber(protocolData.total_users),
            showInfo: true
        }
    ];

    const MetricCard = ({ label, value, showInfo }: {label: any, value: any, showInfo: any}) => (
        <div className="relative bg-[#efefef] py-14 px-4 border rounded-lg">
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="text-black font-semibold text-2xl md:text-4xl pt-2">
                {isLoading ? "..." : value}
            </p>
            {showInfo && (
                <InfoIcon 
                    className="cursor-pointer absolute top-3 right-3 w-5 h-5 text-gray-500"
                />
            )}
        </div>
    );

    if (error) {
        return (
            <div className="bg-white border rounded-lg p-5 text-red-500">
                Error loading protocol data: {error}
            </div>
        );
    }

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