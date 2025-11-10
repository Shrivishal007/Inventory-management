import { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";

const InvoiceDownload = ({ invoiceData, triggerDownload, onDone }) => {
    const invoiceRef = useRef();

    useEffect(() => {
        if (triggerDownload && invoiceRef.current) {
            html2pdf()
                .set({
                    margin: 0.5,
                    filename: `${order.orderId}_invoice.pdf`,
                    html2canvas: { scale: 2 },
                })
                .from(invoiceRef.current)
                .save()
                .then(() => {
                    onDone();
                });
        }
    }, [triggerDownload]);

    if (!invoiceData) return null;

    const { salesperson, order, items, dispatch } = invoiceData;

    return (
        <div
            ref={invoiceRef}
            className="bg-white text-gray-800 p-10 w-[800px] mx-auto font-inter"
        >
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-4xl p-10 text-gray-800">
                <div className="flex justify-between items-center border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-700">
                            Ismail Rice Dealership
                        </h1>
                        <p className="text-sm text-gray-500">
                            Paris Market Street, Chennai-600001
                        </p>
                        <p className="text-sm text-gray-500">
                            GSTIN: 22ABCDE1234F2Z5
                        </p>
                    </div>
                    <img
                        src="/icon.png"
                        alt="Company Logo"
                        className="w-20 h-20 object-contain"
                    />
                </div>

                <div className="grid grid-cols-2 gap-8 mt-5 text-sm">
                    <div>
                        <h2 className="font-semibold text-lg mb-2 text-gray-700">
                            Billed To:
                        </h2>
                        <p>{salesperson.name}</p>
                        <p>{salesperson.emailId}</p>
                        {salesperson.contacts.map((num, idx) => (
                            <p key={idx}>+91 {num}</p>
                        ))}
                        {salesperson.addresses.map((addr, idx) => (
                            <p key={idx}>
                                {addr.street}, {addr.city} - {addr.pincode}
                            </p>
                        ))}
                    </div>

                    <div className="text-right">
                        <h2 className="font-semibold text-lg mb-2 text-gray-700">
                            Invoice Details
                        </h2>
                        <p>
                            Invoice No:&nbsp;
                            <span className="font-medium">{order.orderId}</span>
                        </p>
                        <p>
                            Order Date:&nbsp;
                            {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                        <p>Payment ID: {order.paymentId}</p>
                        <p>
                            Payment Date:&nbsp;
                            {new Date(order.payDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold text-lg mt-2 text-gray-700">
                        Billing Address:
                    </h2>
                    <p>{`${order.billingAddress.street}, ${order.billingAddress.city} - ${order.billingAddress.pincode}`}</p>
                </div>

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="bg-blue-50 border-b">
                            <tr>
                                <th className="py-2 px-3 text-left">Sl.No.</th>
                                <th className="py-2 px-3 text-left">
                                    Rice Name
                                </th>
                                <th className="py-2 px-3 text-left">Price</th>
                                <th className="py-2 px-3 text-left">
                                    Quantity
                                </th>
                                <th className="py-2 px-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} className="border-b">
                                    <td className="py-2 px-3">{i + 1}</td>
                                    <td className="py-2 px-3">
                                        {item.riceName}
                                    </td>
                                    <td className="py-2 px-3">
                                        {item.quotedPrice.toLocaleString(
                                            "en-IN",
                                            {
                                                style: "currency",
                                                currency: "INR",
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </td>
                                    <td className="py-2 px-3">
                                        {item.quantity.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        {item.amount.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-500 italic mb-2 text-right">
                        *All weights are measured in quintals.
                    </p>
                </div>

                <div className="flex justify-end mt-2">
                    <div className="w-1/2">
                        <div className="flex justify-between py-1">
                            <span>Subtotal:</span>
                            <span>
                                {order.totalPrice.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>CGST (2.5%):</span>
                            <span>
                                {(order.tax / 2).toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>SGST (2.5%):</span>
                            <span>
                                {(order.tax / 2).toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Tax (5%):</span>
                            <span>
                                {order.tax.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 font-semibold border-t mt-2">
                            <span>Grand Total:</span>
                            <span>
                                {order.amount.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {dispatch && (
                    <div className="mt-5">
                        <h2 className="font-semibold text-lg text-gray-700 mb-2">
                            Dispatch Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                            <p>Vehicle Number: {dispatch.vehicleNumber}</p>
                            <p>Driver: {dispatch.driverName}</p>
                            <p>Contact: {dispatch.driverContact}</p>
                            <p>
                                Start Date:&nbsp;
                                {new Date(
                                    dispatch.startDate
                                ).toLocaleDateString()}
                            </p>
                            <p>
                                Delivery Date:&nbsp;
                                {new Date(
                                    dispatch.deliveryDate
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                <div className="border-t mt-10 pt-4 text-center text-sm text-gray-500">
                    <p>Thank you for your business!</p>
                    <p>
                        For queries, contact: support@ismailrice.com | +91 91765
                        43432
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDownload;
