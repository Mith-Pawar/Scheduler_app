import React from "react";
import "../App.css";

const Footer = () => {
    return (
        <div className="footer">
            <p>
                Guided By:{" "}
                <a href="SIR_LINK" target="_blank" rel="noreferrer" className="sir-link">
                    Prof. Harsh Bhor
                </a>
            </p>

            <p>
                Developed By:{" "}
                <a href="LINK3" target="_blank" rel="noreferrer">Vaidik Patel</a>,{" "}
                <a href="https://www.linkedin.com/in/mith-pawar-07b413320/" target="_blank" rel="noreferrer">Mith Pawar</a>,{" "}
                <a href="https://www.linkedin.com/in/moksh-patel-b06a1232b/" target="_blank" rel="noreferrer">Moksh Patel </a>,{" "}
                <a href="LINK3" target="_blank" rel="noreferrer">Abhishek   </a>,{" "}
                <a href="https://www.linkedin.com/in/kush-pagariya/" target="_blank" rel="noreferrer">Kush Pagariya</a>,{" "}
                <a href="https://www.linkedin.com/in/jinay-paleja-784612333/" target="_blank" rel="noreferrer">Jinay Paleja</a>,{" "}
            </p>

            <div
                className="scroll-top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
                ↑
            </div>
        </div>
    );
};

export default Footer;