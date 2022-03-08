import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';


const PrivateRoute = ({ component: Component, ...rest }) => {
    const { currentUser } = useAuth();
    return (
        <Route
          {...rest}
          render={props => {
            if (currentUser) {
                if (!currentUser.emailVerified) {
                    return <Redirect to="/pendingverification" />
                } else {
                    return <Component {...props} />
                }
            } else {
                return <Redirect to="/signIn" />
            }
          }}
        ></Route>
      );
}

export default PrivateRoute;