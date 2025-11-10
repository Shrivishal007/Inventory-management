import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "lucide-react";

const OwnerQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuotes = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await api().get("/admin/quotes");
                setQuotes(res.data.pendingQuotes);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.error || err.message);
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotes();
    }, []);

    const handleDecision = async (quoteNumber, action) => {
        try {
            await api().post("/admin/quotes", { quoteNumber, action });
            setQuotes((prev) =>
                prev.filter((q) => q.quoteNumber !== quoteNumber)
            );
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8 font-poppins">
            <button
                onClick={() => navigate("/owner/dashboard")}
                className="sticky top-4 left-4 z-10 mb-6 bg-gray-700 hover:bg-gray-900 text-white p-2 rounded-full transition opacity-50"
            >
                <ArrowLeftIcon />
            </button>

            <header className="mb-6">
                <h2 className="text-2xl font-semibold text-[#004aad]">
                    Quotes Overview
                </h2>
                <p className="text-gray-600">
                    Review all quotes, see items, totals, and approve/reject
                    pending ones.
                </p>
            </header>

            {loading ? (
                <p className="text-[#004aad] font-medium mb-4">
                    Loading quotes...
                </p>
            ) : error ? (
                <p className="text-[#b71c1c] bg-[#fdecea] px-4 py-2 rounded-md inline-block mb-4">
                    {error}
                </p>
            ) : quotes.length === 0 ? (
                <p className="text-center text-gray-600 mt-8">
                    No quotes found.
                </p>
            ) : (
                <div className="flex flex-col gap-6">
                    {quotes.map((q, idx) => {
                        const totalQuantity =
                            q.items?.reduce((sum, i) => sum + i.quantity, 0) ||
                            0;
                        const totalPrice =
                            q.items?.reduce(
                                (sum, i) => sum + i.quantity * i.quotedPrice,
                                0
                            ) || 0;

                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Quote #{q.quoteNumber}
                                </h3>

                                <p className="text-gray-700 mb-2">
                                    <strong>Salesperson ID: </strong>
                                    {q.salesPersonId}
                                </p>
                                <p className="text-gray-700 mb-2">
                                    <strong>Salesperson Name: </strong>
                                    {q.salesPersonName}
                                </p>

                                <div className="mt-4">
                                    <h4 className="font-semibold text-[#004aad] mb-2">
                                        Items
                                    </h4>
                                    {q.items?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-200 text-sm">
                                                <thead className="bg-[#e6f0ff] text-[#004aad]">
                                                    <tr>
                                                        <th className="py-2 px-3 text-left border">
                                                            Rice Id
                                                        </th>
                                                        <th className="py-2 px-3 text-left border">
                                                            Rice
                                                        </th>
                                                        <th className="py-2 px-3 text-left border">
                                                            Quantity (in
                                                            Quintals)
                                                        </th>
                                                        <th className="py-2 px-3 text-left border">
                                                            Price/Quintal
                                                        </th>
                                                        <th className="py-2 px-3 text-left border">
                                                            Subtotal
                                                        </th>
                                                        <th className="py-2 px-3 text-left border">
                                                            In Stock (in
                                                            Quintals)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {q.items.map((item, i) => (
                                                        <tr
                                                            key={i}
                                                            className="even:bg-gray-50 hover:bg-gray-100"
                                                        >
                                                            <td className="py-2 px-3 border">
                                                                {item.riceId}
                                                            </td>
                                                            <td className="py-2 px-3 border">
                                                                {item.riceName}
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
                                                            <td className="py-2 px-3 border">
                                                                {(
                                                                    item.quantity *
                                                                    item.quotedPrice
                                                                ).toLocaleString(
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
                                                            <td className="py-2 px-3 border">
                                                                {item.stockAvailable.toLocaleString(
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
                                    ) : (
                                        <p className="text-gray-500 text-sm">
                                            No items found for this quote.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 text-gray-700 space-y-1">
                                    <p>
                                        <strong>Total Quantity: </strong>
                                        {totalQuantity.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })} quintal
                                    </p>
                                    <p>
                                        <strong>Total Price: </strong>
                                        {totalPrice.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition"
                                        onClick={() =>
                                            handleDecision(
                                                q.quoteNumber,
                                                "Approve"
                                            )
                                        }
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md transition"
                                        onClick={() =>
                                            handleDecision(
                                                q.quoteNumber,
                                                "Reject"
                                            )
                                        }
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OwnerQuotes;
