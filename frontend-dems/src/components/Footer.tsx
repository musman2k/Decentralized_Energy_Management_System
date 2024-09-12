import React from "react";

const Footer: React.FC = () => {
  return (
    <footer style={{ textAlign: "center", padding: "1em 0", backgroundColor: "#0000" }}>
      <p>
        Project created by <strong>Muhammad Usman</strong> | 
        SZABIST 2024 <br />
        <a href="mailto:bscs2012358@szabist.pk">bscs2012358@szabist.pk</a> |{" "}
        <a href="https://www.linkedin.com/in/usman-yousuf-2k/" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </p>
      <p>All rights reserved © {new Date().getFullYear()}</p>
    </footer>
  );
};

export default Footer;
