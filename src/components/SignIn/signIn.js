import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';


import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import Alert from '@material-ui/lab/Alert';

import './signIn.scss';


const SignIn = () => {
    const { login } = useAuth(); 
    const history = useHistory();  

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => { 
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            setLoading(false); 
            history.push('/');

        } catch(error) {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-email') setError('Invalid email entered.');
            if (errorCode === 'auth/user-disabled') setError('Account has been disabled');
            if (errorCode === 'auth/user-not-found') setError('Incorrect email or password.');
            if (errorCode === 'auth/wrong-password') setError('Incorrect email or password.');
            if (errorCode === null || errorCode === '') setError('An error has occured, Please try again.');
            setLoading(false); 
        }
    }

    return(<Fragment>
        <div className="signin">
            <div className="signin__container">
                <span className="signin__container--login">LOGIN</span>
                <span>Please enter your e-mail and password:</span>

                <div className="signin__form">
                    {error && <Alert severity="error" style={{ marginBottom: '25px' }}>{error}</Alert>}
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
                        <Button 
                            variant="outlined" 
                            className="signin__form--button"
                            type="submit"
                            disabled={loading}
                            block={true}
                        >
                            {!loading ? 'LOGIN' : 'LOGGING IN'}
                        </Button>
                    </form>
                </div>
                <span>or <Link className="text-link" to="/forgotPass">Forgot Password</Link></span>
                <span className="mt-4">Don't have an account? <Link className="text-link" to="/signUp">Create one</Link></span>
            </div>
        </div> 
    </Fragment>);
}

export default SignIn;