import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const Navbar = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="navbar">
            <div className="navbar-logo">KJSIT</div>

            <div className="menu-toggle" onClick={() => setOpen(!open)}>
                ☰
            </div>

            <div className={`navbar-links ${open ? "active" : ""}`}>
                <Link to="/" onClick={() => setOpen(false)}>Home</Link>
                <Link to="/admin-dashboard" onClick={() => setOpen(false)}>Admin</Link>
                <Link to="/teacher-dashboard" onClick={() => setOpen(false)}>Teacher</Link>
                <Link to="/leave-requests" onClick={() => setOpen(false)}>Leave</Link>
                <Link to="/swap-requests" onClick={() => setOpen(false)}>Swap</Link>

            </div>
        </div>
    );
};

export default Navbar;