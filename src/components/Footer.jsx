import React from "react";
import "../App.css";

const Footer = () => {
    return (
        <>
            {/* ===== TOP WHITE + BLUE SECTION ===== */}
            <div className="footer-top">

                {/* LEFT SIDE */}
                <div className="footer-left">
                    <div className="logo-container">
                        <img
                            src="/logo.jpeg"   // change path if needed
                            alt="Somaiya Logo"
                            className="footer-logo-large"
                        />

                        <p className="contact">
                            91-22-24061408 / 91-22-24061403 /<a href="mailto:info.tech@somaiya.edu">info.tech@somaiya.edu</a>
                        </p>

                    </div>
                </div>

                <div className="footer-right">
                    <div className="social-icons">

                        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                            <i className="fab fa-facebook-f"></i>
                        </a>

                        <a href="https://www.instagram.com/kjsieit_22/" target="_blank" rel="noreferrer">
                            <i className="fab fa-instagram"></i>
                        </a>

                        <a href="https://x.com/kjsieit1" target="_blank" rel="noreferrer">
                            <i className="fab fa-twitter"></i>
                        </a>

                        <a href="https://www.youtube.com/kjsieitofficial" target="_blank" rel="noreferrer">
                            <i className="fab fa-youtube"></i>
                        </a>

                        <a href="https://www.linkedin.com/school/kjsit/posts/?feedView=all" target="_blank" rel="noreferrer">
                            <i className="fab fa-linkedin-in"></i>
                        </a>

                    </div>

                    <h3>Department of Information Technology</h3>
                    <p>2024-25</p>
                </div>

            </div>


            {/* ===== YOUR EXISTING BLUE FOOTER ===== */}
            <div className="footer">
                <p>
                    Guided By:{" "}
                    <a href="https://www.linkedin.com/in/drhbhor-3a721039/" target="_blank" rel="noreferrer" className="sir-link">
                        Prof. Harsh Bhor
                    </a>
                </p>

                <p>
                    Developed By:{" "}
                    <a href="https://www.linkedin.com/in/vaidik-patel-524979388?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer">Vaidik Patel</a>,{" "}
                    <a href="https://www.linkedin.com/in/mith-pawar-07b413320?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer">Mith Pawar</a>,{" "}
                    <a href="https://www.linkedin.com/in/moksh-patel-b06a1232b/" target="_blank" rel="noreferrer">Moksh Patel</a>,{" "}
                    <a href="https://www.linkedin.com/in/abhishek-kumar-03a041335?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer">Abhishek Kumar</a>,{" "}
                    <a href="https://www.linkedin.com/in/kush-pagariya/" target="_blank" rel="noreferrer">Kush Pagariya</a>,{" "}
                    <a href="https://www.linkedin.com/in/jinay-paleja-784612333/" target="_blank" rel="noreferrer">Jinay Paleja</a>
                </p>

                <div
                    className="scroll-top"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    ↑
                </div>
            </div>
        </>
    );
};

export default Footer;