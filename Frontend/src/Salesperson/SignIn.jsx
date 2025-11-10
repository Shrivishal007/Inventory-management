const SignIn = ({
    emailId,
    password,
    setEmailId,
    setPassword,
    handleLogin,
}) => {
    return (
        <div className="bg-white flex flex-col items-center justify-center px-12 text-center h-full w-full">
            <h1 className="font-bold m-0 text-2xl text-blue-900">Sign in</h1>

            <input
                type="text"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="Email Id"
                className="bg-blue-50 border border-blue-200 rounded-md p-3 my-2 w-full focus:border-blue-500 focus:outline-none transition duration-300"
            />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-blue-50 border border-blue-200 rounded-md p-3 my-2 w-full focus:border-blue-500 focus:outline-none transition duration-300"
            />

            <button
                onClick={() => handleLogin(emailId, password)}
                className="bg-blue-600 border border-blue-600 text-white text-sm font-bold uppercase py-3 px-10 tracking-wider rounded-full mt-4 disabled:opacity-50 hover:bg-blue-700 hover:border-blue-700 transition duration-300"
            >
                Sign In
            </button>
        </div>
    );
};

export default SignIn;
