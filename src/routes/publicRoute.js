import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';


const PublicRoute = ({ component: Component, ...rest }) => {
    const { currentUser } = useAuth();
    return (
        <Route
          {...rest}
          render={props => {
            if (currentUser) {
                if (currentUser.emailVerified === false) {
                    return <Redirect to="/pendingverification" />
                } else {
                    return <Component {...props} />
                }
            } else {
                return <Component {...props} />
            }
          }}
        ></Route>
      );
}

export default PublicRoute;