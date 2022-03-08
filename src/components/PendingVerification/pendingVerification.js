import React, { Fragment, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';


import './pendingVerification.scss';

const PendingVerification = () => {
    const { currentUser } = useAuth();
    const history = useHistory(); 

    useEffect(() => {
        if (currentUser === null) {
            history.push('/');
        } else {
            if (currentUser.emailVerified === true) history.push('/');   
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return(<Fragment>
        <div className="pendingverif">
            <div className="pendingverif__container container">
                <span><FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: '100px', color: 'green', marginBottom: '20px' }} /></span>
                <span className="pendingverif__container--header">Verify your email address</span>
                <p>Hello {currentUser ? currentUser.displayName : ''},</p>
                <p className="pendingverif__container--message">Thank you for registering your account with Go Bigas!</p>
                <p className="pendingverif__container--message">We have sent a link to your email for verification. Please follow the instructions provided in the mail in order to proceed.</p>
            </div>
        </div>
    </Fragment>);
}

export default PendingVerification;