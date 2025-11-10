import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OwnerLogin = () => {
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:3000/api/admin/login",
                {
                    adminId,
                    password,
                }
            );

            toast.success(res.data.message);
            navigate("/owner/dashboard");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="font-poppins h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
            <div className="flex items-center justify-center w-full h-full">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-[400px] max-w-[90%] text-center animate-fadeIn">
                    <div className="text-blue-700 font-semibold mb-3 tracking-wide">
                        🌾 Rice Dealer Management
                    </div>
                    <h2 className="text-[#003366] text-2xl font-semibold mb-6">
                        Owner Login
                    </h2>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter your Admin Id"
                                value={adminId}
                                onChange={(e) => {
                                    if (/^\d{0,15}$/.test(e.target.value))
                                        setAdminId(e.target.value);
                                }}
                                className={`w-full p-3 rounded-lg border text-[15px] outline-none transition-all duration-300 ${
                                    !adminId
                                        ? "border-red-500"
                                        : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                }`}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full p-3 rounded-lg border text-[15px] outline-none transition-all duration-300 ${
                                    !password
                                        ? "border-red-500"
                                        : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                }`}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg p-3 text-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-cyan-600"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OwnerLogin;
