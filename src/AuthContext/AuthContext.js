import React, { useContext, useState, useEffect, Fragment } from 'react';
import { auth } from '../firebase/firebase';

const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    const login = (email, password) => {
        return auth.signInWithEmailAndPassword(email, password);
    }

    const logout = () => {
        return auth.signOut();
    }

    const createUser = (email, password, firstName, lastName) => {
        return auth.createUserWithEmailAndPassword(email, password);
    }

    const updatePassword = (password) => {
        return currentUser.updatePassword(password);
    }

    const updateProfile = (firstName, lastName) => {
        const displayName = firstName + ' ' + lastName;
        return auth.currentUser.updateProfile({ displayName: displayName  });
    }

    const sendEmailVerification = () => {
        return auth.currentUser.sendEmailVerification();
    }

    const applyActionCode = (actionCode) => {
        return auth.applyActionCode(actionCode);
    }

    const sendPasswordResetEmail = (email) => {
        return auth.sendPasswordResetEmail(email);
    }

    const verifyPasswordResetCode = (actionCode) => {
        return auth.verifyPasswordResetCode(actionCode);
    }

    const confirmPasswordReset  = (actionCode, newPassword) => {
        return auth.confirmPasswordReset(actionCode, newPassword);
    }

    const changePassword = (newPassword) => {
        return auth.currentUser.updatePassword(newPassword);
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value ={
        currentUser,
        login,
        logout,
        createUser,
        updatePassword,
        updateProfile,
        sendEmailVerification,
        applyActionCode,
        sendPasswordResetEmail,
        verifyPasswordResetCode,
        confirmPasswordReset,
        changePassword,
    }


    return(<Fragment>
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    </Fragment>);
}
