import { Plus, X } from "lucide-react";

const SignUp = ({
    addressList,
    contacts,
    setAddressList,
    setContacts,
    handleRegister,
}) => {
    return (
        <form
            onSubmit={handleRegister}
            className="bg-white flex flex-col px-12 py-5 text-center h-full w-full"
        >
            <h1 className="font-bold m-0 text-2xl text-blue-900">
                Create Account
            </h1>

            <input
                type="text"
                name="name"
                placeholder="Name"
                required
                pattern="[A-Za-z\s]+"
                className="bg-blue-50 border border-blue-200 rounded-md p-3 my-2 w-full focus:border-blue-500 focus:outline-none transition duration-300"
            />
            <input
                type="email"
                name="email_id"
                placeholder="Email"
                required
                className="bg-blue-50 border border-blue-200 rounded-md p-3 my-2 w-full focus:border-blue-500 focus:outline-none transition duration-300"
            />

            <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="bg-blue-50 border border-blue-200 rounded-md p-3 my-2 w-full focus:border-blue-500 focus:outline-none transition duration-300"
            />

            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                className="bg-blue-50 border rounded-md p-3 my-2 w-full focus:border-blue-500 focus:outline-none transition duration-300 border-blue-200"
            />

            <label className="text-sm font-semibold text-gray-700 mt-2 text-left w-full">
                Addresses
            </label>
            {addressList.map((address, index) => (
                <div key={index} className="flex items-center my-1">
                    <input
                        type="text"
                        placeholder={`Address ${
                            index + 1
                        } (Street Address, City - Pincode)`}
                        value={address}
                        onChange={(e) => {
                            const newAddresses = [...addressList];
                            newAddresses[index] = e.target.value;
                            setAddressList(newAddresses);
                        }}
                        required
                        className="bg-blue-50 border border-blue-200 rounded-md p-3 my-1 w-full text-sm focus:border-blue-500 focus:outline-none transition duration-300"
                    />
                    {addressList.length > 1 && (
                        <button type="button"
                            onClick={() => {
                                const newAddresses = addressList.filter(
                                    (_, i) => i !== index
                                );
                                setAddressList(newAddresses);
                            }}
                            className="text-red-500 hover:text-red-700 transition duration-200 font-bold text-lg px-2"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    )}
                </div>
            ))}

            <button type="button"
                className="flex items-center justify-center gap-2 bg-gray-100 text-blue-600 text-sm font-medium py-2 px-3 rounded-xl mt-1 mb-2 hover:bg-gray-200 transition duration-300 add-btn"
                onClick={() => setAddressList([...addressList, ""])}
            >
                <Plus className="w-5 h-5"/> Add Address
            </button>

            <label className="text-sm font-semibold text-gray-700 mt-2 text-left w-full">
                Contact Numbers
            </label>
            {contacts.map((contact, index) => (
                <div key={index} className="flex items-center gap-2 my-1">
                    <input
                        type="text"
                        placeholder={`Contact ${index + 1} (1234567890)`}
                        value={contact}
                        onChange={(e) => {
                            if (/^\d{0,10}$/.test(e.target.value)) {
                                const newContacts = [...contacts];
                                newContacts[index] = e.target.value;
                                setContacts(newContacts);
                            }
                        }}
                        required
                        className="bg-blue-50 border border-blue-200 rounded-md p-3 my-1 w-full text-sm focus:border-blue-500 focus:outline-none transition duration-300"
                    />
                    {contacts.length > 1 && (
                        <button type="button"
                            onClick={() => {
                                const newContacts = contacts.filter(
                                    (_, i) => i !== index
                                );
                                setContacts(newContacts);
                            }}
                            className="text-red-500 hover:text-red-700 transition duration-200 font-bold text-lg px-2"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    )}
                </div>
            ))}

            <button type="button"
                className="flex items-center justify-center gap-2 bg-gray-100 text-blue-600 text-sm font-medium py-2 px-3 rounded-xl mt-1 mb-4 hover:bg-gray-200 transition duration-300"
                onClick={() => setContacts([...contacts, ""])}
            >
                <Plus className="w-5 h-5"/> <span>Add Contact</span>
            </button>

            <button
                type="submit"
                onSubmit={handleRegister}
                className="bg-blue-600 border border-blue-600 text-white text-sm font-bold uppercase py-3 px-10 tracking-wider rounded-full mt-4 disabled:opacity-50 hover:bg-blue-700 hover:border-blue-700 transition duration-300"
            >
                Sign Up
            </button>
        </form>
    );
};

export default SignUp;
