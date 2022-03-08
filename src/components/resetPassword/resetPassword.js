import React, { Fragment, useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import Alert from '@material-ui/lab/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './resetPassword.scss';

const ResetPassword = (props) => {
    const { currentUser, verifyPasswordResetCode, confirmPasswordReset } = useAuth(); 
    const history = useHistory(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [error, setError] = useState('');

    useEffect(async() => {
        if (currentUser === null) {
            const params = new URLSearchParams(props.location.search);
            const oobCode = params.get('oobCode');
            if (oobCode === null) history.push('/');
            try {
                setVerifyError('');
                setPageLoading(true);
                const email = await verifyPasswordResetCode(oobCode);
                setEmail(email);
                setTimeout(() => {
                    setPageLoading(false);
                }, 2000);  
            } catch(error) {
                const errorCode = error.code;
                if (errorCode === 'auth/expired-action-code') setVerifyError('The password reset link is expired, Please request for a new one.');
                if (errorCode === 'auth/invalid-action-code') setVerifyError('The password reset link is invalid, Please request for a new one.');
                if (errorCode === 'auth/user-disabled') setVerifyError('User account has been disabled by adminstrator.');
                if (errorCode === 'auth/user-not-found') setVerifyError('User not found.');
                if (errorCode === null || errorCode === '') setVerifyError('An error has occured, Please try again.');
                setTimeout(() => {
                    setPageLoading(false);
                }, 2000);  
            }
        } else {
            history.push('/');
        }
    }, []);

    const handleSubmit = async (e) => { 
        e.preventDefault();
        const params = new URLSearchParams(props.location.search);
        const oobCode = params.get('oobCode');
        try {
            setError('');
            setLoading(true);
            if(password !== confirmPassword) {
                setError('Password and Confirm Password does not match.');
                setLoading(false);
            } else {
                await confirmPasswordReset(oobCode, password);
                setLoading(false);
                history.push('/signIn');
            }

        } catch(error) {
            const errorCode = error.code;
            if (errorCode === 'auth/weak-password') setError('Password must contain more than 8 characters.');
            if (errorCode === null || errorCode === '') setError('An error has occured, Please try again.');
            setLoading(false);
        }
    }

    return(<Fragment>
        <div className="resetPass">
            <div className="resetPass__container">
                {pageLoading && <span><FontAwesomeIcon className="fa-spin" icon={faSpinner} style={{ fontSize: '100px', color: 'gray', marginBottom: '20px' }} /></span>}
                {pageLoading && <span className="resetPass__container--header">PROCESSING</span>}
                {pageLoading && <span style={{ textAlign: 'center' }}>Please wait while we verify your password reset request.</span>}
                
                {!pageLoading && verifyError && <span><FontAwesomeIcon icon={faTimes} style={{ fontSize: '100px', color: 'red', marginBottom: '20px' }} /></span>}
                {!pageLoading && verifyError && <span className="resetPass__container--header">VERIFY ERROR</span>}
                {!pageLoading && verifyError && <span style={{ textAlign: 'center' }}>{verifyError}</span>}


                {!pageLoading && !verifyError && <span className="resetPass__container--header">SET NEW PASSWORD</span>}
                {!pageLoading && !verifyError && <span>Please enter new password for: {email}</span>}
                {!pageLoading && !verifyError && <div className="resetPass__form">
                    {error && <Alert severity="error" style={{ marginBottom: '25px' }}>{error}</Alert>}
                    <form autoComplete="off" onSubmit={handleSubmit}>
                        <TextField 
                            label="Password" 
                            variant="outlined"
                            type="password" 
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        />
                        <TextField 
                            label="Confirm Password" 
                            variant="outlined"
                            type="password" 
                            fullWidth
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        />  
                        <Button 
                            variant="outlined" 
                            className="resetPass__form--button"
                            type="submit"
                            disabled={loading}
                            block={true}
                        >
                            {!loading ? 'SET PASSWORD' : 'SETTING PASSWORD'}
                        </Button>
                    </form>                  
                </div>}
            </div>
        </div>
    </Fragment>);
}

export default ResetPassword;