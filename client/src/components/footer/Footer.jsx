import React from "react";
import './Footer.css';
import Search from '../search/Search';



function Footer() {
  return (
    <div className="footerContainer">
      <div className="firstFooter">
        <div className="firstSubFooter">
            <div className="footerTitle">Threadi</div>
        </div>
        <div className="footerSubTitle">Follow Threadi for more exciting content</div>
        <img className="githubLogo" src="/images/square-github.svg" alt="" />
      </div>
      <div className="secondFooter">
        <div className="footerSubTitle">Social</div>
        <div className="footerSubTitle">Profile</div>
        <div className="footerSubTitle">Browse</div>
      </div>
      <div className="firstFooter">
        <div className="firstSubFooter">
            <div className="footerTitle">Contributors</div>
        </div>
        <div>James Schoeder</div>
        <div>Kolt Bodzo</div>
        <div>Roy Hargrave</div>
        <div>Xaviar Witherspoon</div>

      </div>
    </div>
  );
}

export default Footer;
