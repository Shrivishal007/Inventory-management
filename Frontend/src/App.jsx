import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./Homepage.jsx";
import OwnerLogin from "./Owner/OwnerLogin.jsx";
import OwnerDashboard from "./Owner/OwnerDashboard.jsx";
import OwnerQuotes from "./Owner/OwnerQuotes.jsx";
import OwnerOrders from "./Owner/OwnerOrders.jsx";
import OwnerSalespeople from "./Owner/OwnerSalespeople.jsx";
import UpdateStock from "./Owner/UpdateStock.jsx";
import SalespersonLogin from "./Salesperson/SalespersonLogin.jsx";
import SalespersonDashboard from "./Salesperson/SalespersonDashboard.jsx";
import SalespersonQuotes from "./Salesperson/SalespersonQuotes.jsx";
import SalespersonOrders from "./Salesperson/SalespersonOrders.jsx";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/owner/login" element={<OwnerLogin />} />
                    <Route
                        path="/owner/dashboard"
                        element={<OwnerDashboard />}
                    />
                    <Route path="/owner/quotes" element={<OwnerQuotes />} />
                    <Route path="/owner/orders" element={<OwnerOrders />} />
                    <Route
                        path="/owner/salespeople"
                        element={<OwnerSalespeople />}
                    />
                    <Route path="/owner/update-stock" element={<UpdateStock />} />

                    <Route
                        path="/sales-person/login"
                        element={<SalespersonLogin />}
                    />
                    <Route
                        path="/sales-person/dashboard/:userId"
                        element={<SalespersonDashboard />}
                    />
                    <Route
                        path="/sales-person/:userId/quotes"
                        element={<SalespersonQuotes />}
                    />
                    <Route
                        path="/sales-person/:userId/orders"
                        element={<SalespersonOrders />}
                    />
                </Routes>
            </Router>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 1500,
                    success: { duration: 1200 },
                    error: { duration: 1500 },
                }}
            />
        </>
    );
}

export default App;
