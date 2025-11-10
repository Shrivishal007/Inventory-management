import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

const UpdateStock = () => {
    const [riceList, setRiceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [changedRiceIds, setChangedRiceIds] = useState(new Set());
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRice = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await api().get("/rice-varieties");
                setRiceList(res.data);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.error || err.message);
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRice();
    }, []);

    const handleChange = (index, field, value) => {
        const updatedRice = riceList.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setRiceList(updatedRice);

        setChangedRiceIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(updatedRice[index].riceId);
            return newSet;
        });
    };

    const handleSubmit = async () => {
        if (changedRiceIds.size === 0) {
            toast("No changes made.", { icon: "ℹ️" });
            return;
        }

        const emptyFields = riceList
            .filter((rice) => changedRiceIds.has(rice.riceId))
            .some(
                (rice) =>
                    rice.minPrice === "" ||
                    rice.maxPrice === "" ||
                    rice.stockAvailable === ""
            );

        if (emptyFields) {
            toast.error("Some fields are empty.");
            return;
        }

        setUpdating(true);

        try {
            const updates = riceList
                .filter((rice) => changedRiceIds.has(rice.riceId))
                .map((rice) => ({
                    riceId: rice.riceId,
                    minPrice: parseFloat(rice.minPrice),
                    maxPrice: parseFloat(rice.maxPrice),
                    stockAvailable: parseFloat(rice.stockAvailable),
                }));

            const res = await api().post("/set-prices", updates);
            toast.success(res.data?.message);
            setChangedRiceIds(new Set());
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        } finally {
            setUpdating(false);
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

            <h2 className="text-2xl font-semibold text-[#004aad] mb-6">
                Update Rice Details
            </h2>

            {loading ? (
                <p className="text-[#004aad] font-medium">
                    Loading rice details...
                </p>
            ) : error ? (
                <p className="text-[#b71c1c] bg-[#fdecea] px-4 py-2 rounded-md inline-block">
                    {error}
                </p>
            ) : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 mb-6">
                            <thead>
                                <tr className="bg-[#e6f0ff] text-[#004aad]">
                                    <th className="py-3 px-4 text-left font-semibold border-b">
                                        Rice Id
                                    </th>
                                    <th className="py-3 px-4 text-left font-semibold border-b">
                                        Rice Name
                                    </th>
                                    <th className="py-3 px-4 text-left font-semibold border-b">
                                        Min Price
                                    </th>
                                    <th className="py-3 px-4 text-left font-semibold border-b">
                                        Max Price
                                    </th>
                                    <th className="py-3 px-4 text-left font-semibold border-b">
                                        Stock Available (in Quintals)
                                    </th>
                                    <th className="py-3 px-4 text-left font-semibold border-b">
                                        Last Changes made
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {riceList.map((rice, idx) => (
                                    <tr
                                        key={rice.riceId}
                                        className={`hover:bg-[#f5f8ff] ${
                                            changedRiceIds.has(rice.riceId)
                                                ? "bg-yellow-100"
                                                : "even:bg-gray-50"
                                        }`}
                                    >
                                        <td className="py-2 px-4 border-b">
                                            {rice.riceId}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {rice.riceName}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                type="text"
                                                value={rice.minPrice}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (
                                                        /^\d{0,8}\.?\d{0,2}$/.test(
                                                            val
                                                        ) ||
                                                        val === ""
                                                    ) {
                                                        handleChange(
                                                            idx,
                                                            "minPrice",
                                                            val
                                                        );
                                                    }
                                                }}
                                                className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004aad]/50"
                                            />
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                type="text"
                                                value={rice.maxPrice}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (
                                                        /^\d{0,8}\.?\d{0,2}$/.test(
                                                            val
                                                        ) ||
                                                        val === ""
                                                    ) {
                                                        handleChange(
                                                            idx,
                                                            "maxPrice",
                                                            val
                                                        );
                                                    }
                                                }}
                                                className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004aad]/50"
                                            />
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <input
                                                type="text"
                                                value={rice.stockAvailable}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (
                                                        /^\d{0,8}\.?\d{0,2}$/.test(
                                                            val
                                                        ) ||
                                                        val === ""
                                                    ) {
                                                        handleChange(
                                                            idx,
                                                            "stockAvailable",
                                                            val
                                                        );
                                                    }
                                                }}
                                                className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004aad]/50"
                                            />
                                        </td>
                                        <td>
                                            {new Date(
                                                rice.lastChangedDate
                                            ).toLocaleString("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={updating}
                        className={`px-6 py-2 rounded-md font-medium text-white transition ${
                            updating
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-[#004aad] hover:bg-[#00337a]"
                        }`}
                    >
                        {updating ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpdateStock;
