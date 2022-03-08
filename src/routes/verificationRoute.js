import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';


const VerificationRoute = ({ component: Component, ...rest }) => {
    const { currentUser } = useAuth();
    return (
        <Route
          {...rest}
          render={props => {
            if (currentUser) {
                return <Redirect to="/pendingverification" />
            } else {
                return <Component {...props} />
            }
          }}
        ></Route>
      );
}

export default VerificationRoute;