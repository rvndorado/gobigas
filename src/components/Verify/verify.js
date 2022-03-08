import React, { Fragment, useEffect } from 'react';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';

const Verify = (props) => {
    const { currentUser } = useAuth();
    const history = useHistory(); 

    useEffect(() => {
        const params = new URLSearchParams(props.location.search);
        const oobCode = params.get('oobCode'); 
        const mode = params.get('mode');

        if (currentUser === null) {
            if(mode === 'resetPassword') {
                const url = '/' + mode +'?oobCode=' + oobCode;
                history.push(url);
            } else {
                history.push('/');
            }
            
        } else {
            if (currentUser.emailVerified === true) {
                history.push('/'); 
            }  else {
                const url = '/' + mode +'?oobCode=' + oobCode;
                history.push(url);
            }
        }
    }, [])

    return(<Fragment>
        <h1></h1>
    </Fragment>);
}

export default Verify;