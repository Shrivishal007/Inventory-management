import { useState } from "react";
import "./AuthStyles.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const SalespersonLogin = () => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");
    const [addressList, setAddressList] = useState([""]);
    const [contacts, setContacts] = useState([""]);

    const handleSignUpClick = () => setIsSignUpActive(true);
    const handleSignInClick = () => setIsSignUpActive(false);
    const navigate = useNavigate();

    const handleLogin = async (emailId, password) => {
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailId)) {
            toast.error("Enter Valid Email.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:3000/api/sales-person/login",
                { emailId, password }
            );
            toast.success(res.data.message);
            navigate(`/sales-person/dashboard/${res.data.userId}`);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const form = e.target;
        const name = form.name.value;
        const emailId = form.email_id.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        const addresses = addressList.map((address) => {
            const [street, parts = ""] = address
                .split(",")
                .map((item) => item.trim());
            const [city = "", pincode = ""] = parts
                .split("-")
                .map((item) => item.trim());
            return { street, city, pincode };
        });

        if (password !== confirmPassword) {
            toast.error("Password and Confirm Password does not match.");
            return;
        }

        for (const address of addresses) {
            if (
                !address.street ||
                !address.city ||
                !address.pincode ||
                !/^\d{6}$/.test(address.pincode)
            ) {
                toast.error("Please fill in Valid Addresses!");
                return;
            }
        }

        for (const contact of contacts) {
            if (!/^\d{10}$/.test(contact)) {
                toast.error("Please fill in Valid Contact Numbers!");
                return;
            }
        }

        try {
            const res = await axios.post(
                "http://localhost:3000/api/sales-person/register",
                {
                    name,
                    emailId,
                    password,
                    contacts,
                    addresses,
                }
            );

            toast.success(res.data.message);
            e.target.reset();
            setAddressList([""]);
            setContacts([""]);
            handleSignInClick();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="new flex justify-center items-center h-screen font-inter m-0">
            <div
                className={`container bg-white rounded-xl shadow-2xl relative overflow-hidden w-full max-w-4xl min-h-[500px] ${
                    isSignUpActive ? "right-panel-active" : ""
                }`}
            >
                <div
                    className={`form-container sign-in-container ${
                        !isSignUpActive ? "" : "hidden"
                    }`}
                >
                    <SignIn
                        emailId={emailId}
                        password={password}
                        setEmailId={setEmailId}
                        setPassword={setPassword}
                        handleLogin={handleLogin}
                    />
                </div>
                <div
                    className={`form-container sign-up-container overflow-y-auto ${
                        isSignUpActive ? "" : "hidden"
                    }`}
                >
                    <SignUp
                        addressList={addressList}
                        contacts={contacts}
                        setAddressList={setAddressList}
                        setContacts={setContacts}
                        handleRegister={handleRegister}
                    />
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left text-white p-10 flex flex-col justify-center items-center">
                            <h1 className="font-bold m-0 text-2xl text-white">
                                Welcome Back!
                            </h1>
                            <p className="text-sm font-light leading-snug tracking-wider my-5 text-white">
                                To keep connected, please login with your info
                            </p>

                            <button
                                className="ghost bg-transparent border border-white text-white text-sm font-bold uppercase py-3 px-10 tracking-wider rounded-full mt-2 hover:bg-white hover:text-blue-600 transition duration-300"
                                onClick={handleSignInClick}
                            >
                                Sign In
                            </button>
                        </div>

                        <div className="overlay-panel overlay-right text-white p-10 flex flex-col justify-center items-center">
                            <h1 className="font-bold m-0 text-2xl text-white">
                                Hello, Dealer!
                            </h1>
                            <p className="text-sm font-light leading-snug tracking-wider my-5 text-white">
                                Enter details and start managing your rice
                                business
                            </p>

                            <button
                                className="ghost bg-transparent border border-white text-white text-sm font-bold uppercase py-3 px-10 tracking-wider rounded-full mt-2 hover:bg-white hover:text-blue-600 transition duration-300"
                                onClick={handleSignUpClick}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalespersonLogin;
