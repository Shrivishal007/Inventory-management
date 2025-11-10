import { useRef } from "react";
import { Link } from "react-router-dom";

function HomePage() {
    const sectionRefs = {
        about: useRef(null),
        services: useRef(null),
        achievements: useRef(null),
        testimonials: useRef(null),
        loginSection: useRef(null),
    };

    const scrollTo = (name) =>
        sectionRefs[name].current.scrollIntoView({ behavior: "smooth" });

    return (
        <div className="font-montserrat">
            <header className="sticky top-0 z-50 bg-blue-900 text-white shadow-md px-6 md:px-12 py-4 flex justify-between items-center">
                <nav className="flex flex-wrap gap-5 text-sm md:text-base">
                    <p
                        onClick={() => scrollTo("about")}
                        className="cursor-pointer hover:underline"
                    >
                        About Us
                    </p>
                    <p
                        onClick={() => scrollTo("services")}
                        className="cursor-pointer hover:underline"
                    >
                        Services
                    </p>
                    <p
                        onClick={() => scrollTo("achievements")}
                        className="cursor-pointer hover:underline"
                    >
                        Achievements
                    </p>
                    <p
                        onClick={() => scrollTo("testimonials")}
                        className="cursor-pointer hover:underline"
                    >
                        Testimonials
                    </p>
                </nav>
                <button
                    onClick={() => scrollTo("loginSection")}
                    className="border-2 border-white px-4 py-1.5 rounded-md hover:bg-white hover:text-blue-900 transition"
                >
                    Login/Register
                </button>
            </header>

            <section className="bg-[url('/photo.png')] relative h-[600px] flex justify-center items-center bg-cover bg-center text-center text-white">
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative px-4 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Ismail Rice Dealership
                    </h1>
                    <p className="mb-6 text-lg">
                        Delivering quality rice from trusted suppliers to your
                        doorstep since 2001.
                    </p>
                    <button
                        onClick={() => scrollTo("loginSection")}
                        className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-3 rounded-md transition-transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>
            </section>

            <section
                ref={sectionRefs.about}
                className="py-16 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10"
            >
                <div className="bg-[url('/src.jpg')] flex-1 h-72 bg-cover bg-center rounded-lg shadow-lg"></div>
                <div className="flex-1 text-gray-700">
                    <h2 className="text-3xl font-bold text-blue-900 mb-4">
                        About Us
                    </h2>
                    <p className="text-lg leading-relaxed">
                        Ismail Rice Dealership has been serving customers with
                        high-quality rice for over 24 years. Our mission is to
                        make rice trading seamless, from farmers to consumers.
                    </p>
                </div>
            </section>

            <section
                ref={sectionRefs.services}
                className="bg-gray-50 py-16 px-6"
            >
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
                    Our Services
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            icon: "🛒",
                            title: "Online Ordering",
                            desc: "Order rice online from verified suppliers.",
                        },
                        {
                            icon: "✅",
                            title: "Verified Suppliers",
                            desc: "All our suppliers are vetted for quality.",
                        },
                        {
                            icon: "🚚",
                            title: "Fast Delivery",
                            desc: "Receive rice at your doorstep quickly and safely.",
                        },
                    ].map((service, i) => (
                        <div
                            key={i}
                            className="bg-white shadow-md rounded-xl p-8 flex flex-col items-center text-center hover:shadow-xl transition"
                        >
                            <div className="cursor-default w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-5">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-600">{service.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section
                ref={sectionRefs.achievements}
                className="py-16 px-6 flex flex-wrap justify-center gap-8 max-w-6xl mx-auto"
            >
                {[
                    { number: "20+", text: "Years in Business" },
                    { number: "70+", text: "Suppliers Network" },
                    { number: "1,000+", text: "Orders Delivered" },
                    { number: "4.2 ⭐", text: "Customer Satisfaction" },
                ].map((a, i) => (
                    <div
                        key={i}
                        className="bg-white shadow-md rounded-xl p-6 w-56 text-center hover:shadow-lg transition"
                    >
                        <div className="text-2xl font-bold text-blue-900 mb-2">
                            {a.number}
                        </div>
                        <p className="text-gray-700">{a.text}</p>
                    </div>
                ))}
            </section>

            <section
                ref={sectionRefs.testimonials}
                className="py-16 px-6 max-w-6xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">
                    What Our Clients Say
                </h2>
                <div className="flex flex-wrap justify-center gap-6">
                    {[
                        {
                            text: "High-quality rice and excellent delivery service!",
                            author: "Ramesh K.",
                        },
                        {
                            text: "Easy online ordering and reliable delivery.",
                            author: "Priya S.",
                        },
                        {
                            text: "Trusted suppliers, timely delivery, great service.",
                            author: "Arjun P.",
                        },
                    ].map((testimonial, i) => (
                        <div
                            key={i}
                            className="bg-white shadow-md rounded-lg p-6 w-80 text-center hover:shadow-lg transition"
                        >
                            <p className="italic text-gray-700 mb-3">
                                "{testimonial.text}"
                            </p>
                            <p className="font-semibold text-blue-900">
                                - {testimonial.author}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section
                ref={sectionRefs.loginSection}
                className="py-16 flex flex-wrap justify-center gap-10 px-6 bg-blue-50"
            >
                {[
                    {
                        role: "Salesperson",
                        desc: "Manage orders, track sales, and view your dashboard.",
                        link: "/sales-person/login",
                    },
                    {
                        role: "Owner",
                        desc: "Handle inventory, suppliers, and business reports.",
                        link: "/owner/login",
                    },
                ].map((login, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg shadow-md w-72 p-8 text-center transform hover:-translate-y-2 hover:shadow-lg transition"
                    >
                        <h3 className="text-xl font-bold text-blue-900 mb-3">
                            {login.role}
                        </h3>
                        <p className="text-gray-600 mb-5">{login.desc}</p>
                        <Link
                            to={login.link}
                            className="bg-blue-900 text-white px-5 py-2 rounded-md hover:bg-blue-800 transition"
                        >
                            Login
                        </Link>
                    </div>
                ))}
            </section>

            <footer className="bg-blue-900 text-white text-center py-6 text-sm space-y-1">
                <div>
                    Ismail Rice Dealership, Paris Market Street, Chennai -
                    600001
                </div>
                <div>
                    Email:{" "}
                    <a href="mailto:info@ismailrice.com" className="underline">
                        info@ismailrice.com
                    </a>
                </div>
                <div>
                    Phone:{" "}
                    <a href="tel:+919176543432" className="underline">
                        +91 91765 43432
                    </a>
                </div>
                <div>All rights reserved © 2025</div>
            </footer>
        </div>
    );
}

export default HomePage;
