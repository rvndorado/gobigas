import React, { Fragment } from 'react';

import { Link } from 'react-router-dom';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import EmailIcon from '@material-ui/icons/Email';


import './footer.scss';

const Footer = () => {
    return(<Fragment>
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-content__socials">
                    <span><FacebookIcon style={{ fontSize: 50 }} /></span>
                    <span><InstagramIcon style={{ fontSize: 50 }} /></span>
                    <span><EmailIcon style={{ fontSize: 50 }} /></span>
                </div>
                <div className="footer-content__links">
                    <Link to="/faqs">FAQs</Link>
                    <Link to="/shipping">Shipping & Return</Link>
                    <Link to="/terms">Terms and Conditions</Link>
                    <Link to="/track">Track Order</Link>
                </div>
                <div className="footer-content__payment">
                    <span>Payment Powered by: </span><a href="#">Paymongo</a>
                </div>
                <div className="footer-content__copyright">
                    <span>©2020 Gobigas</span>
                </div>
            </div>
        </footer>   
    </Fragment>);
}

export default Footer;