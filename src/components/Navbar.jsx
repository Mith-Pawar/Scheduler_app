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
                <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
                <Link to="/teacher" onClick={() => setOpen(false)}>Teacher</Link>
                <Link to="/leave" onClick={() => setOpen(false)}>Leave</Link>
                <Link to="/swap" onClick={() => setOpen(false)}>Swap</Link>
            </div>
        </div>
    );
};

export default Navbar;