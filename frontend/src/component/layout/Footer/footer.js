import React from "react";
import playStore from "../../../images/playstore.png";
import appStore from "../../../images/Appstore.png";
import "./footer.css";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="leftFooter">
        <h4>DOWNLOAD OUR APP</h4>
        <p>Download App for Android and IOS mobile phone</p>
        <img src={playStore} alt="playstore" />
        <img src={appStore} alt="Appstore" />
      </div>

      <div className="midFooter">
        <h1>E-COMMERCE</h1>
        <p>High Quality is our first priority</p>

        <p>Copyrights 2021 &copy; M.Tayyab</p>
      </div>

      <div className="rightFooter">
        <h4>Follow Us</h4>
        <a href="https://www.instagram.com/tayyabamir283/">Instagram</a>
        <a href="https://www.youtube.com/channel/UCv-IDGAY_WIHOBCGOcd_nJQ">Youtube</a>
        <a href="https://www.facebook.com/profile.php?id=100012753461692">Facebook</a>
      </div>
    </footer>
  );
};

export default Footer;