import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "lucide-react";

const SalespersonQuotes = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [riceVarieties, setRiceVarieties] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [changedRiceIds, setChangedRiceIds] = useState(new Set());

    const fetchRice = async () => {
        try {
            const res = await axios.get(
                "http://localhost:3000/api/rice-varieties"
            );
            setRiceVarieties(res.data);

            const initial = {};
            res.data.forEach((r) => {
                initial[r.riceId] = {
                    quantity: "",
                    quotedPrice: "",
                };
            });
            setFormValues(initial);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRice();
    }, []);

    const handleChange = (riceId, field, value) => {
        setFormValues((prev) => {
            const updated = {
                ...prev,
                [riceId]: {
                    ...prev[riceId],
                    [field]: value,
                },
            };

            setChangedRiceIds((prevId) => {
                const newSet = new Set(prevId);
                const { quantity, quotedPrice } = updated[riceId];

                if (quantity || quotedPrice) newSet.add(riceId);
                else newSet.delete(riceId);
                return newSet;
            });

            return updated;
        });
    };

    const handleSubmit = async () => {
        if (changedRiceIds.size === 0) {
            toast("No changes made.", { icon: "ℹ️" });
            return;
        }

        const emptyFields = Array.from(changedRiceIds).some(
            (id) =>
                formValues[id].quantity === "" ||
                formValues[id].quotedPrice === ""
        );

        if (emptyFields) {
            toast.error(
                "Please fill both Quantity and Price for selected rice varieties."
            );
            return;
        }
        const updates = Array.from(changedRiceIds).map((id) => ({
            riceId: parseInt(id),
            quantity: parseFloat(formValues[id].quantity),
            quotedPrice: parseFloat(formValues[id].quotedPrice),
        }));

        try {
            setSubmitting(true);
            const res = await axios.post(
                `http://localhost:3000/api/sales-person/${userId}/quotes`,
                updates
            );

            toast.success(res.data?.message);

            const reset = {};
            riceVarieties.forEach((r) => {
                reset[r.riceId] = {
                    quantity: "",
                    quotedPrice: "",
                };
            });
            setFormValues(reset);
            setChangedRiceIds(new Set());
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto px-5 py-10 font-inter">
            <button
                onClick={() => navigate(`/sales-person/dashboard/${userId}`)}
                className="sticky top-4 left-4 z-10 mb-6 bg-gray-700 hover:bg-gray-900 text-white p-2 rounded-full transition opacity-50"
            >
                <ArrowLeftIcon />
            </button>

            <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                Create New Quote
            </h2>

            {loading ? (
                <p className="text-center text-gray-600 mt-10 text-lg">
                    Loading rice varieties...
                </p>
            ) : error ? (
                <div className="text-center py-20 text-lg font-medium text-red-500">
                    {error}
                </div>
            ) : riceVarieties.length === 0 ? (
                <div>No data found.</div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                        {riceVarieties.map((rice) => (
                            <div
                                key={rice.riceId}
                                className={`bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition transform ${
                                    changedRiceIds.has(rice.riceId)
                                        ? "bg-yellow-100"
                                        : ""
                                }`}
                            >
                                <h3 className="text-blue-600 font-semibold text-lg">
                                    {rice.riceName}
                                </h3>

                                {rice.imgUrl && (
                                    <img
                                        src={rice.imgUrl}
                                        alt={rice.riceName}
                                        loading="lazy"
                                        className="w-full h-40 object-cover rounded-md mb-3"
                                    />
                                )}

                                <p className="text-sm text-gray-600 mt-1">
                                    {rice.description}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Price Range: ₹
                                    {(rice.minPrice / 4).toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}{" "}
                                    - ₹
                                    {(rice.maxPrice / 4).toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}{" "}
                                    Per Bag
                                </p>

                                <input
                                    type="text"
                                    placeholder="Quantity (in Bags)"
                                    value={formValues[rice.riceId].quantity}
                                    onChange={(e) =>
                                        handleChange(
                                            rice.riceId,
                                            "quantity",
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                            )
                                        )
                                    }
                                    className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Quoted Price (per 25kg)"
                                    value={formValues[rice.riceId].quotedPrice}
                                    onChange={(e) =>
                                        handleChange(
                                            rice.riceId,
                                            "quotedPrice",
                                            e.target.value.replace(
                                                /[^0-9.]/g,
                                                ""
                                            )
                                        )
                                    }
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`block mx-auto px-6 py-3 rounded-lg text-white text-base font-medium transition ${
                            submitting
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {submitting ? "Submitting..." : "Submit Quote"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SalespersonQuotes;
