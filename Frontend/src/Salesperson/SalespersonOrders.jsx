import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import InvoiceDownload from "./InvoiceDownload.jsx";
import { ArrowLeftIcon } from "lucide-react";

const SalespersonOrders = () => {
    const { userId } = useParams();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [invoiceData, setInvoiceData] = useState(null);
    const [triggerDownload, setTriggerDownload] = useState(false);

    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(
                `http://localhost:3000/api/sales-person/dashboard/${userId}`
            );
            const data = res.data.salesperson;
            setOrders(data.orders || []);
            setAddresses(data.addresses || []);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const payOrder = async (orderId) => {
        if (!selectedAddressId) {
            toast.error("Please select an address first!");
            return;
        }
        try {
            const res = await axios.post(
                `http://localhost:3000/api/sales-person/${userId}/orders/transaction`,
                {
                    action: "Pay",
                    orderId,
                    addressId: selectedAddressId,
                }
            );
            toast.success(res.data?.message);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    const allocateOrder = async (orderId) => {
        try {
            const res = await axios.post(
                `http://localhost:3000/api/sales-person/${userId}/orders/allocate`,
                {
                    orderId,
                }
            );
            toast.success(res.data?.message);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const res = await axios.get(
                `http://localhost:3000/api/sales-person/${userId}/${orderId}`
            );
            setInvoiceData(res.data);
            // setTriggerDownload(true);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    return (
        <div className="font-inter mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md">
            <button
                onClick={() => navigate(`/sales-person/dashboard/${userId}`)}
                className="sticky top-4 left-4 z-10 mb-6 bg-gray-700 hover:bg-gray-900 text-white p-2 rounded-full transition opacity-50"
            >
                <ArrowLeftIcon />
            </button>

            <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
                My Orders
            </h2>

            {loading ? (
                <p className="text-center text-gray-600 text-lg mt-10">
                    Loading orders...
                </p>
            ) : error ? (
                <div className="text-center py-20 text-lg font-medium text-red-500">
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">
                    No orders found
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-blue-600 text-white uppercase text-sm">
                                <th className="py-3 px-4 text-left">
                                    Order ID
                                </th>
                                <th className="py-3 px-4 text-left">Quote</th>
                                <th className="py-3 px-4 text-left">Total</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr
                                    key={o.orderId}
                                    className="border-b hover:bg-blue-50 transition-colors"
                                >
                                    <td className="py-3 px-4">{o.orderId}</td>
                                    <td className="py-3 px-4">
                                        {o.quoteNumber}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-gray-800">
                                        ₹
                                        {o.totalPrice?.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td
                                        className={`py-3 px-4 font-semibold ${
                                            o.orderStatus === "Waiting"
                                                ? "text-yellow-700"
                                                : o.orderStatus === "Paid"
                                                ? "text-green-700"
                                                : o.orderStatus === "Allocated"
                                                ? "text-purple-700"
                                                : o.orderStatus === "Delivered"
                                                ? "text-orange-700"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {o.orderStatus}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {o.orderStatus === "Waiting" &&
                                            addresses.length > 0 && (
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                                    <select
                                                        value={
                                                            selectedAddressId
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedAddressId(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select Address
                                                        </option>
                                                        {addresses.map(
                                                            (a, idx) => (
                                                                <option
                                                                    key={idx}
                                                                    value={
                                                                        a.addressId
                                                                    }
                                                                >
                                                                    {a.street},{" "}
                                                                    {a.city} -{" "}
                                                                    {a.pincode}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    <button
                                                        onClick={() =>
                                                            payOrder(o.orderId)
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
                                                    >
                                                        Pay
                                                    </button>
                                                </div>
                                            )}

                                        {o.orderStatus !== "Waiting" && (
                                            <div className="flex flex-row sm:flex-row items-center justify-center gap-2">
                                                {o.orderStatus === "Paid" && (
                                                    <button
                                                        onClick={() =>
                                                            allocateOrder(
                                                                o.orderId
                                                            )
                                                        }
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
                                                    >
                                                        Allocate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        downloadInvoice(
                                                            o.orderId
                                                        )
                                                    }
                                                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
                                                >
                                                    Download Invoice
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <InvoiceDownload
                invoiceData={invoiceData}
                triggerDownload={triggerDownload}
                onDone={() => setTriggerDownload(false)}
            />
        </div>
    );
};

export default SalespersonOrders;
