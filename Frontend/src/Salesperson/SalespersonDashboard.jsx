import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { BarChart, FileText, PackageOpen } from "lucide-react";
import toast from "react-hot-toast";

const SalespersonDashboard = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [salesperson, setSalesperson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api().get(
                    `/sales-person/dashboard/${userId}`
                );
                setSalesperson(res.data.salesperson);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.error || err.message);
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [userId]);

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="flex min-h-screen bg-[#f6f8fb] font-inter">
            <aside className="w-[230px] bg-blue-900 text-white p-6 sticky top-0 h-screen">
                <h2 className="text-xl mb-6 text-center text-yellow-400 font-semibold">
                    Dealer Portal
                </h2>
                <ul className="space-y-3">
                    <li>
                        <Link
                            to={`/sales-person/dashboard/${userId}`}
                            className="block text-gray-200 px-3 py-2 rounded-md hover:bg-gray-700 transition"
                        >
                            <BarChart size={28} /> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={`/sales-person/${userId}/quotes`}
                            className="block text-gray-200 px-3 py-2 rounded-md hover:bg-gray-700 transition"
                        >
                            <FileText size={28} /> Create Quotes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={`/sales-person/${userId}/orders`}
                            className="block text-gray-200 px-3 py-2 rounded-md hover:bg-gray-700 transition"
                        >
                            <PackageOpen size={28} /> Manage Orders
                        </Link>
                    </li>
                </ul>
            </aside>

            <main className="flex-1 p-8">
                {loading ? (
                    <div className="text-center py-20 text-lg font-medium text-gray-700">
                        Loading dashboard...
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-lg font-medium text-red-500">
                        {error}
                    </div>
                ) : (
                    <div>
                        <header className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Welcome, {salesperson.name}
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    {salesperson.emailId}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                Logout
                            </button>
                        </header>

                        <section className="flex gap-6 mt-6">
                            <div className="flex-1 bg-white rounded-xl text-center p-6 shadow-sm">
                                <h3 className="text-blue-900 font-medium text-base mb-1">
                                    Total Orders
                                </h3>
                                <p className="text-xl font-semibold text-gray-900">
                                    {salesperson.orders.length}
                                </p>
                            </div>
                            <div className="flex-1 bg-white rounded-xl text-center p-6 shadow-sm">
                                <h3 className="text-blue-900 font-medium text-base mb-1">
                                    Total Quotes
                                </h3>
                                <p className="text-xl font-semibold text-gray-900">
                                    {salesperson.quotes.length}
                                </p>
                            </div>
                            <div className="flex-1 bg-white rounded-xl text-center p-6 shadow-sm">
                                <h3 className="text-blue-900 font-medium text-base mb-1">
                                    Total Transaction
                                </h3>
                                <p className="text-xl font-semibold text-gray-900">
                                    {salesperson.orders
                                        .reduce(
                                            (sum, o) => sum + o.totalPrice,
                                            0
                                        )
                                        .toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                </p>
                            </div>
                        </section>

                        <section className="mt-8 bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-blue-900 text-lg font-semibold mb-4">
                                Quotes
                            </h2>

                            {salesperson.quotes.length > 0 ? (
                                salesperson.quotes.map((q) => (
                                    <div
                                        key={q.quoteNumber}
                                        className="mb-8 border border-gray-200 rounded-lg overflow-hidden shadow-md"
                                    >
                                        <div className="flex justify-between items-center bg-blue-50 px-4 py-3 border-b border-gray-200">
                                            <h3 className="text-blue-900 font-semibold">
                                                Quote No: {q.quoteNumber}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    q.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : q.status ===
                                                          "Approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : q.status ===
                                                          "Rejected"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {q.status}
                                            </span>
                                        </div>

                                        <table className="w-full border-collapse">
                                            <thead className="bg-blue-100">
                                                <tr className="border-b border-gray-200 text-left">
                                                    <th className="p-3">
                                                        Rice Name
                                                    </th>
                                                    <th className="p-3">
                                                        Quoted Price
                                                    </th>
                                                    <th className="p-3">
                                                        Quantity
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {q.items.map((item, j) => (
                                                    <tr
                                                        key={j}
                                                        className="border-b border-gray-100 even:bg-gray-50 hover:bg-gray-100"
                                                    >
                                                        <td className="p-3">
                                                            {item.riceName}
                                                        </td>
                                                        <td className="p-3">
                                                            {item.quotedPrice.toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "INR",
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {item.quantity.toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))
                            ) : (
                                <p>No quotes available.</p>
                            )}
                        </section>

                        <section className="mt-8 bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-blue-900 text-lg font-semibold mb-4">
                                Orders
                            </h2>
                            {salesperson.orders.length > 0 ? (
                                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                    <thead className="bg-blue-100">
                                        <tr className="border-b border-gray-200 text-left">
                                            <th className="p-3">Order ID</th>
                                            <th className="p-3">Quote No</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Total Price</th>
                                            <th className="p-3">Items</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesperson.orders.map((o, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-gray-100 even:bg-gray-50 hover:bg-gray-100"
                                            >
                                                <td className="p-3">
                                                    {o.orderId}
                                                </td>
                                                <td className="p-3">
                                                    {o.quoteNumber}
                                                </td>
                                                <td className="p-3">
                                                    {new Date(
                                                        o.orderDate
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td
                                                    className={`p-3 font-semibold ${
                                                        o.orderStatus ===
                                                        "Waiting"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : o.orderStatus ===
                                                              "Paid"
                                                            ? "bg-green-300 text-green-800"
                                                            : o.orderStatus ===
                                                              "Allocated"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : o.orderStatus ===
                                                              "Delivered"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {o.orderStatus}
                                                </td>
                                                <td className="p-3">
                                                    {o.totalPrice.toLocaleString(
                                                        "en-IN",
                                                        {
                                                            style: "currency",
                                                            currency: "INR",
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {o.itemCount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No orders yet.</p>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SalespersonDashboard;
