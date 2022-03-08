import React, { Fragment, useState } from 'react';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import Alert from '@material-ui/lab/Alert';
import Swal from 'sweetalert2';
import './changePassword.scss';


const ChangePassword = () => {
    const { changePassword, logout } = useAuth(); 
    const history = useHistory();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            if(password !== confirmPassword) {
                setError('Password and Confirm Password does not match.');
                setLoading(false);
            } else {
                await changePassword(password);
                Swal.fire(
                    'Success!',
                    'You have now updated your account password.',
                    'success'
                ).then(async() => {
                    await logout();
                    history.push('/signIn');
                });
            }
        } catch(error) {
            const errorCode = error.code;
            
            if (errorCode === 'auth/weak-password') setError('Password must contain more than 8 characters.');
            if (errorCode === 'auth/requires-recent-login') {
                Swal.fire(
                    'Wait',
                    'You need to relogin your account in order to proceed on changing password.',
                    'warning'
                ).then(async() => {
                    setLoading(false);
                    await logout();
                    history.push('/signIn');
                });
            }
            if (errorCode === null || errorCode === '') setError('An error has occured, Please try again.');
            setLoading(false);
        }

    }
    return(<Fragment>
        <div className="changePassword">
            <div className="changePassword__container">
                <span className="changePassword__container--header">CHANGE PASSWORD</span>
                <div className="changePassword__form">
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
                            className="changePassword__form--button"
                            type="submit"
                            disabled={loading}
                            block={true}
                        >
                            {!loading ? 'SET PASSWORD' : 'SETTING PASSWORD'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </Fragment>)
}

export default ChangePassword;