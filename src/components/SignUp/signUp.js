import React, { Fragment, useState } from 'react';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import { Button } from 'react-bootstrap';

import './signUp.scss';

const SignUp = () => {

    const { createUser, updateProfile, sendEmailVerification } = useAuth(); 
    const history = useHistory();  

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            if(password !== confirmPassword) {
                setError('Password and Confirm Password does not match.');
                setLoading(false);
                return;
            }

            await createUser(email, password);
            await updateProfile(firstName, lastName);
            await sendEmailVerification();
            setLoading(false); 
            history.push('/pendingverification');

        } catch(error) {
            const errorCode = error.code;
            if (errorCode === 'auth/email-already-in-use') setError('Email has already been used.');
            if (errorCode === 'auth/invalid-email') setError('Invalid email address entered.');
            if (errorCode === 'auth/weak-password') setError('Password must contain more than 8 characters.');
            if (errorCode === null || errorCode === '') setError('An error has occured, Please try again.');  
            setLoading(false);         
        }
       
    }


    return(<Fragment>
        <div className="signup">
            <div className="signup__container">
                <span className="signup__container--register">REGISTER</span>
                <span>Please fill in the information below:</span>
                
                <div className="signup__form">
                    {error && <Alert severity="error" style={{ marginBottom: '25px' }}>{error}</Alert>}
                    <form autoComplete="off" onSubmit={handleSubmit}>
                        <TextField 
                            label="First Name" 
                            variant="outlined"
                            fullWidth
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        />
                        <TextField 
                            label="Last Name" 
                            variant="outlined"
                            fullWidth
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ marginBottom: '12px' }}
                        /> 
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
                            className="signup__form--button"
                            type="submit"
                            disabled={loading}
                            block={true}
                        >
                            {!loading ? 'CREATE MY ACCOUNT' : 'CREATING ACCOUNT'}
                        </Button>                                                                                             
                    </form>
                </div>
            </div>
        </div>
    </Fragment>);
}

export default SignUp;