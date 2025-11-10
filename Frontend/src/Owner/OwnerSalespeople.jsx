import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";

const OwnerSalespeople = () => {
    const [salespeople, setSalespeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [salespersonId, setSalespersonId] = useState("");
    const [filteredSalespeople, setFilteredSalespeople] = useState([]);
    const navigate = useNavigate();

    const handleApplyFilter = () => {
        if (salespersonId.trim() === "") {
            setFilteredSalespeople(salespeople);
        } else {
            const filtered = salespeople.filter(
                (sp) => sp.userId.toString() === salespersonId.trim()
            );
            setFilteredSalespeople(filtered);
        }
    };

    useEffect(() => {
        const fetchSalespeople = async () => {
            try {
                const res = await api().get("/admin/dashboard/salesperson");
                setSalespeople(res.data);
                setFilteredSalespeople(res.data);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.error || err.message);
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSalespeople();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8 font-poppins">
            <button
                onClick={() => navigate("/owner/dashboard")}
                className="sticky top-4 left-4 z-10 mb-6 bg-gray-700 hover:bg-gray-900 text-white p-2 rounded-full transition opacity-50"
            >
                <ArrowLeftIcon />
            </button>

            <header className="mb-6">
                <h2 className="text-2xl font-semibold text-[#004aad] mb-1">
                    Salespeople Details
                </h2>
                <p className="text-gray-600">
                    All salespeople and their quotes
                </p>
            </header>

            <div className="bg-white shadow-sm p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                    <div>
                        <input
                            type="text"
                            name="salespersonId"
                            value={salespersonId}
                            onChange={(e) => {
                                if (/^\d{0,8}$/.test(e.target.value))
                                    setSalespersonId(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyFilter();
                            }}
                            placeholder="Salesperson ID"
                            className="border border-gray-300 rounded-md p-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-2 sm:mt-0">
                    <button
                        onClick={() => {
                            setSalespersonId("");
                            setFilteredSalespeople(salespeople);
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-[#004aad] font-medium mb-4">
                    Loading salespeople...
                </p>
            ) : error ? (
                <p className="text-[#b71c1c] bg-[#fdecea] px-4 py-2 rounded-md inline-block mb-4">
                    {error}
                </p>
            ) : filteredSalespeople.length === 0 ? (
                <p className="text-center text-gray-600 mt-8">
                    No salespeople found.
                </p>
            ) : (
                filteredSalespeople.map((sp) => (
                    <div
                        key={sp.userId}
                        className="bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition"
                    >
                        <h3 className="text-lg font-semibold text-[#004aad] mb-2">
                            {sp.name}
                            <span className="text-gray-600 text-sm">
                                {` (ID: ${sp.userId})`}
                            </span>
                        </h3>
                        <p className="text-gray-700 mb-3">
                            <strong>Email: </strong>
                            {sp.emailId}
                        </p>

                        <div className="mb-4">
                            <h4 className="text-[#004aad] font-semibold mb-1">
                                Contact Numbers
                            </h4>
                            {sp.contactNumbers?.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-700">
                                    {sp.contactNumbers.map((c, i) => (
                                        <li key={i}>+91 {c}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No contacts
                                </p>
                            )}
                        </div>

                        <div className="mt-4">
                            <h4 className="text-[#004aad] font-semibold mb-2">
                                Quotes
                            </h4>

                            {sp.quotes?.length > 0 ? (
                                <div className="space-y-6">
                                    {sp.quotes.map((quote, i) => (
                                        <div
                                            key={i}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <div className="flex flex-wrap justify-between items-center mb-3">
                                                <h5 className="text-blue-900 font-semibold">
                                                    Quote #{quote.quoteNumber}
                                                </h5>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        quote.status ===
                                                        "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : quote.status ===
                                                              "Approved"
                                                            ? "bg-green-100 text-green-800"
                                                            : quote.status ===
                                                              "Rejected"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {quote.status}
                                                </span>
                                            </div>

                                            {quote.items?.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full border border-gray-200 text-sm bg-white rounded-md">
                                                        <thead className="bg-[#e6f0ff] text-[#004aad]">
                                                            <tr>
                                                                <th className="py-2 px-3 text-left border">
                                                                    Rice Name
                                                                </th>
                                                                <th className="py-2 px-3 text-left border">
                                                                    Quantity (in Quintals)
                                                                </th>
                                                                <th className="py-2 px-3 text-left border">
                                                                    Price
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {quote.items.map(
                                                                (item, j) => (
                                                                    <tr
                                                                        key={j}
                                                                        className="even:bg-gray-50 hover:bg-gray-100"
                                                                    >
                                                                        <td className="py-2 px-3 border">
                                                                            {
                                                                                item.riceName
                                                                            }
                                                                        </td>
                                                                        <td className="py-2 px-3 border">
                                                                            {item.quantity.toLocaleString(
                                                                                "en-IN",
                                                                                {
                                                                                    minimumFractionDigits: 2,
                                                                                    maximumFractionDigits: 2,
                                                                                }
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2 px-3 border">
                                                                            {item.price.toLocaleString(
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
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">
                                                    No items in this quote
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No quotes
                                </p>
                            )}
                        </div>

                        <div className="mt-4">
                            <h4 className="text-[#004aad] font-semibold mb-2">
                                Orders
                            </h4>
                            {sp.orders?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 text-sm">
                                        <thead className="bg-[#e6f0ff] text-[#004aad]">
                                            <tr>
                                                <th className="py-2 px-3 text-left border">
                                                    Order No
                                                </th>
                                                <th className="py-2 px-3 text-left border">
                                                    Quote No
                                                </th>
                                                <th className="py-2 px-3 text-left border">
                                                    Total Price (without GST)
                                                </th>
                                                <th className="py-2 px-3 text-left border">
                                                    Order Date
                                                </th>
                                                {sp.orders.some(
                                                    (order) =>
                                                        order.status ===
                                                        "Allocated"
                                                ) && (
                                                    <>
                                                        <th className="py-2 px-3 text-left border">
                                                            Driver Name
                                                        </th>
                                                        <th className="py-2 px-3 text-left border">
                                                            Vehicle Number
                                                        </th>
                                                    </>
                                                )}
                                                <th className="py-2 px-3 text-left border">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sp.orders.map((o, i) => (
                                                <tr
                                                    key={i}
                                                    className="even:bg-gray-50 hover:bg-gray-100"
                                                >
                                                    <td className="py-2 px-3 border">
                                                        {o.orderId}
                                                    </td>
                                                    <td className="py-2 px-3 border">
                                                        {o.quoteNumber}
                                                    </td>
                                                    <td className="py-2 px-3 border">
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
                                                    <td className="py-2 px-3 border">
                                                        {new Date(
                                                            o.orderDate
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    {sp.orders.some(
                                                        (order) =>
                                                            order.status ===
                                                            "Allocated"
                                                    ) && (
                                                        <>
                                                            <td className="py-2 px-3 border">
                                                                {o.driverName}
                                                            </td>
                                                            <td className="py-2 px-3 border">
                                                                {
                                                                    o.vehicleNumber
                                                                }
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="py-2 px-3 border">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                o.status ===
                                                                "Waiting"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : o.status ===
                                                                      "Paid"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : o.status ===
                                                                      "Allocated"
                                                                    ? "bg-purple-100 text-purple-800"
                                                                    : o.status ===
                                                                      "Delivered"
                                                                    ? "bg-orange-100 text-orange-800"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No orders
                                </p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OwnerSalespeople;
