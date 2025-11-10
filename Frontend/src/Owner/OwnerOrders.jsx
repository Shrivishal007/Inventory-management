import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";

const OwnerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [salespersonId, setSalespersonId] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();

    const fetchAllOrders = async (appliedFilters = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(appliedFilters).filter(([_, v]) => v)
                )
            ).toString();
            const res = await api().get(
                `/admin/orders${params ? `?${params}` : ""}`
            );
            setOrders(res.data);
            setError("");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8 font-poppins">
            <button
                onClick={() => navigate("/owner/dashboard")}
                className="sticky top-4 left-4 z-10 mb-6 bg-gray-700 hover:bg-gray-900 text-white p-2 rounded-full transition opacity-50"
            >
                <ArrowLeftIcon />
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#004aad] mb-1">
                    All Orders
                </h2>
                <p className="text-gray-600">Overview of all placed orders</p>
            </div>

            <div className="bg-white shadow-sm p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Salesperson ID
                        </label>
                        <input
                            type="text"
                            name="salespersonId"
                            value={salespersonId}
                            onChange={(e) => {
                                if (/^\d{0,8}$/.test(e.target.value))
                                    setSalespersonId(e.target.value);
                            }}
                            placeholder="1000"
                            className="border border-gray-300 rounded-md p-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <div className="flex flex-wrap items-center gap-3 text-sm rounded-md p-2 w-fit">
                            {["Waiting", "Paid", "Allocated", "Delivered"].map(
                                (s) => (
                                    <label
                                        key={s}
                                        className="flex items-center gap-1"
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={s}
                                            checked={status === s}
                                            onChange={(e) =>
                                                setStatus(e.target.value)
                                            }
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span>{s}</span>
                                    </label>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-2 sm:mt-0">
                    <button
                        onClick={() =>
                            fetchAllOrders({ salespersonId, status })
                        }
                        className="bg-[#004aad] hover:bg-[#00368c] text-white px-4 py-2 rounded-md transition"
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => {
                            setSalespersonId("");
                            setStatus("");
                            fetchAllOrders();
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-[#004aad] font-medium">Loading orders...</p>
            ) : error ? (
                <p className="text-[#d32f2f] bg-[#fdecea] px-4 py-2 rounded-md inline-block mb-4">
                    {error}
                </p>
            ) : orders.length === 0 ? (
                <p className="text-center text-gray-600 mt-8">
                    No orders found
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-[#e6f0ff] text-[#004aad]">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Salesperson ID
                                </th>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Order ID
                                </th>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Quote Number
                                </th>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Salesperson
                                </th>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Total Price
                                </th>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Status
                                </th>
                                <th className="py-3 px-4 text-left font-semibold">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr
                                    key={o.orderId}
                                    className="border-b hover:bg-[#f5f8ff] transition"
                                >
                                    <td className="py-3 px-4">
                                        {o.salespersonId}
                                    </td>
                                    <td className="py-3 px-4">{o.orderId}</td>
                                    <td className="py-3 px-4">
                                        {o.quoteNumber}
                                    </td>
                                    <td className="py-3 px-4">
                                        {o.salesperson}
                                    </td>
                                    <td className="py-3 px-4">
                                        {o.totalPrice.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>

                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                o.orderStatus === "Waiting"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : o.orderStatus === "Paid"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : o.orderStatus ===
                                                      "Allocated"
                                                    ? "bg-green-100 text-green-800"
                                                    : o.orderStatus ===
                                                      "Delivered"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {o.orderStatus}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        {new Date(
                                            o.orderDate
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OwnerOrders;
