import React, { Fragment, useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './verifyEmail.scss';

const VerifyEmail = (props) => {
    const { currentUser, applyActionCode } = useAuth();
    const history = useHistory(); 

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(async() => {

        if (currentUser === null) {
            history.push('/');
        } else {
            if (currentUser.emailVerified === true) {
                history.push('/'); 
            }  else {
                const params = new URLSearchParams(props.location.search);
                const oobCode = params.get('oobCode'); 
                if (oobCode === null) history.push('/');
                try {
                    setLoading(true);
                    setError('');
                    await applyActionCode(oobCode);
                    setTimeout(() => {
                        setLoading(false);
                    }, 2000); 
                    setTimeout(() => {
                        window.location.reload();
                    }, 5000);
                } catch(error) {
                    const errorCode = error.code;
                    if (errorCode === 'auth/expired-action-code') setError('It seems that you have clicked an invalid verification link.');
                    if (errorCode === 'auth/invalid-action-code') setError('It seems that you have clicked an invalid verification link.');
                    if (errorCode === 'auth/user-disabled') setError('The current user is disabled by the administrator group.');
                    if (errorCode === 'auth/user-not-found') setError('The user being activated might be deleted/disabled.');
                    if (errorCode === null || errorCode === '') setError('An error has occured, Please try again.');
                    setTimeout(() => {
                        setLoading(false);
                    }, 2000); 
                }

            }
        }

    }, []);


    return(<Fragment>

        <div className="verifyemail">
            <div className="verifyemail__container container">
                {loading && <span><FontAwesomeIcon className="fa-spin" icon={faSpinner} style={{ fontSize: '100px', color: 'gray', marginBottom: '20px' }} /></span>}
                {loading && <span className="verifyemail__container--header">Processing Email Verification</span>}


                {!loading && !error && <span><FontAwesomeIcon icon={faUserCheck} style={{ fontSize: '100px', color: 'green', marginBottom: '20px' }} /></span>}
                {!loading && !error && <span className="verifyemail__container--header">Email Verification Success</span>}
                {!loading && !error && <p className="verifyemail__container--message">Thank you for verifying your account with Go Bigas!</p>}
                {!loading && !error && <p className="verifyemail__container--message">The page will automatically refresh after 5 seconds or refresh the page to proceed.</p>}

                {!loading && error && <span><FontAwesomeIcon icon={faTimes} style={{ fontSize: '100px', color: 'red', marginBottom: '20px' }} /></span>}
                {!loading && error && <span className="verifyemail__container--header">Email Verification Failed</span>}
                {!loading && error && <p className="verifyemail__container--message">{error}</p>}
            </div>
        </div>
    </Fragment>);
}


export default VerifyEmail;