import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart3,
    Package,
    Users,
    FileText,
    RefreshCw,
    Home,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OwnerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeSalespeople: 0,
        pendingQuotes: 0,
    });
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");
            const statsRes = await axios.get(
                "http://localhost:3000/api/admin/dashboard"
            );
            const {
                totalRevenue,
                orderCount,
                salespersonCount,
                pendingQuoteCount,
            } = statsRes.data;

            setStats({
                totalRevenue: totalRevenue,
                totalOrders: orderCount,
                activeSalespeople: salespersonCount,
                pendingQuotes: pendingQuoteCount,
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (path) => navigate(path);

    const getRoundedTarget = (value) => {
        if (value <= 0) return 10;

        const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
        const rounded = Math.ceil(value / magnitude) * magnitude;
        return rounded;
    };

    const targetRevenue = getRoundedTarget(stats.totalRevenue);
    const percentage =
        targetRevenue > 0 ? (stats.totalRevenue / targetRevenue) * 100 : 0;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        let current = 0;
        const step = percentage / 50;
        const interval = setInterval(() => {
            current += step;
            if (current >= percentage) {
                current = percentage;
                clearInterval(interval);
            }
            setProgress(current);
        }, 15);

        return () => clearInterval(interval);
    }, [percentage]);

    return (
        <div className="flex h-screen w-screen bg-[#f8f9fc] font-poppins">
            <aside className="sticky top-0 h-screen w-64 bg-white shadow-lg flex flex-col p-5">
                <div className="mb-6">
                    <h2 className="text-blue-800 text-xl font-bold">
                        Rice Dealer
                    </h2>
                    <p className="text-gray-600 text-sm">Owner</p>
                    <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded-full mt-2 inline-block">
                        Admin
                    </span>
                </div>

                <nav className="flex flex-col gap-2 mt-4">
                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-blue-700 bg-blue-50 font-medium"
                        onClick={() => navigate("/owner/dashboard")}
                    >
                        <BarChart3 size={18} /> Dashboard
                    </button>

                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                        onClick={() => navigate("/owner/quotes")}
                    >
                        <FileText size={18} /> Quotes
                    </button>

                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                        onClick={() => navigate("/owner/orders")}
                    >
                        <Package size={18} /> Orders
                    </button>

                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                        onClick={() => navigate("/owner/salespeople")}
                    >
                        <Users size={18} /> Salespeople
                    </button>

                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                        onClick={() => navigate("/owner/update-stock")}
                    >
                        <RefreshCw size={18} /> Update Stock
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700"
                        onClick={() => navigate("/")}
                    >
                        <Home size={18} /> Logout
                    </button>
                </nav>
            </aside>
            <main className="relative flex-1 p-10 overflow-y-auto flex flex-col items-center justify-center">
                {loading ? (
                    <p className="text-[#004aad] font-medium mb-4">
                        Loading Dashboard...
                    </p>
                ) : error ? (
                    <p className="text-[#b71c1c] bg-[#fdecea] px-4 py-2 rounded-md inline-block mb-4">
                        {error}
                    </p>
                ) : (
                    <div className="relative z-10 flex flex-col items-center space-y-10">
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-10 flex flex-col items-center">
                            <h3 className="text-gray-700 text-lg font-semibold mb-6">
                                Total Revenue
                            </h3>
                            <div className="w-64 h-64 relative flex items-center justify-center">
                                <CircularProgressbar
                                    value={progress}
                                    text=""
                                    styles={buildStyles({
                                        pathColor: "#2563eb",
                                        trailColor: "#dbeafe",
                                        textColor: "#1e3a8a",
                                        textSize: "12px",
                                        pathTransitionDuration: 0.8,
                                    })}
                                />

                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-blue-900 text-lg font-bold">
                                        <CountUp
                                            end={stats.totalRevenue}
                                            duration={1.5}
                                            separator=","
                                            decimals={2}
                                            prefix="₹"
                                        />
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-500 mt-6 text-sm">
                                Target: ₹{targetRevenue.toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                            <div
                                className="bg-white/80 backdrop-blur rounded-xl shadow-md p-6 flex flex-col items-center hover:-translate-y-1 transition cursor-pointer"
                                onClick={() => handleCardClick("/owner/orders")}
                            >
                                <h4 className="text-gray-600 text-sm font-medium">
                                    Total Orders
                                </h4>
                                <p className="text-blue-700 text-2xl font-bold mt-1">
                                    {stats.totalOrders}
                                </p>
                            </div>

                            <div
                                className="bg-white/80 backdrop-blur rounded-xl shadow-md p-6 flex flex-col items-center hover:-translate-y-1 transition cursor-pointer"
                                onClick={() => handleCardClick("/owner/quotes")}
                            >
                                <h4 className="text-gray-600 text-sm font-medium">
                                    Pending Quotes
                                </h4>
                                <p className="text-blue-700 text-2xl font-bold mt-1">
                                    {stats.pendingQuotes}
                                </p>
                            </div>

                            <div
                                className="bg-white/80 backdrop-blur rounded-xl shadow-md p-6 flex flex-col items-center hover:-translate-y-1 transition cursor-pointer"
                                onClick={() =>
                                    handleCardClick("/owner/salespeople")
                                }
                            >
                                <h4 className="text-gray-600 text-sm font-medium">
                                    Active Salespeople
                                </h4>
                                <p className="text-blue-700 text-2xl font-bold mt-1">
                                    {stats.activeSalespeople}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OwnerDashboard;
