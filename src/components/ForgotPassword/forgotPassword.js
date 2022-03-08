import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';    

import './forgotPassword.scss';

import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import Alert from '@material-ui/lab/Alert';

const ForgotPassword = () => {
    const { sendPasswordResetEmail } = useAuth(); 

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setEmailSent(false);
            setLoading(true);
            await sendPasswordResetEmail(email);
            setLoading(false);
            setEmailSent(true);
            setEmail('');
        } catch(error) {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-email') setError('The email you have entered is not associated to an account.');
            if (errorCode === 'auth/user-not-found') setError('No user found with that email.');
            if (errorCode === null || errorCode === '') setError('An error has occured, Please try again.');
            setLoading(false);
            setEmailSent(false);
        }
    }

    return(<Fragment>
        <div className="forgotPass">
            <div className="forgotPass__container">
                <span className="forgotPass__container--header">FORGOT PASSWORD</span>
                <span style={{ textAlign: 'center' }}>Please enter your e-mail and we will sent the steps to recover your password.</span>
                <div className="forgotPass__form">
                    {error && <Alert severity="error" style={{ marginBottom: '25px' }}>{error}</Alert>}
                    {emailSent && <Alert severity="success" style={{ marginBottom: '25px' }}>Password recovery guide sucessfully sent.</Alert>}
                    <form autoComplete="off" onSubmit={handleSubmit}>
                        <TextField 
                                label="Email" 
                                variant="outlined"
                                type="email" 
                                fullWidth
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ marginBottom: '12px' }}
                        />
                        <Button 
                            variant="outlined" 
                            className="forgotPass__form--button"
                            type="submit"
                            disabled={loading}
                            block={true}
                        >
                            {!loading ? 'RECOVER' : 'PROCESSING'}
                        </Button>
                    </form>
                </div>
                <span className="mt-4">Remember your password? <Link className="text-link" to="/signIn">Back to login</Link></span>
            </div>
        </div>
    </Fragment>);
}

export default ForgotPassword;