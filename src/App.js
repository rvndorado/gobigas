import React, { Fragment, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';


import { AuthProvider } from './AuthContext/AuthContext';
import NavBar from './presentationals/NavBar/navBar';
import Footer from './presentationals/Footer/footer';
import Home from './components/Home/home';
import SignIn from './components/SignIn/signIn';
import SignUp from './components/SignUp/signUp';
import PendingVerification from './components/PendingVerification/pendingVerification';
import ForgotPassword from './components/ForgotPassword/forgotPassword';
import VerifyEmail from './components/VerifyEmail/verifyEmail';
import ResetPassword from './components/resetPassword/resetPassword';
import Shop from './components/Shop/shop';
import Verify from './components/Verify/verify';
import ProductDetails from './components/ProductDetails/productDetails';
import Checkout from './components/Checkout/checkOut';
import PaymentVerify from './components/PaymentVerify/paymentVerify';
import OrderHistory from './components/OrderHistory/orderHistory';
import OrderDetails from './components/OrderDetails/orderDetails';
import TrackOrder from './components/TrackOrder/trackOrder';
import ChangePassword from './components/ChangePassword/changePassword';
import TermsConditions from './components/TermsConditions/termsConditions';
import FAQs from './components/FAQs/faqs';
import ShippingReturns from './components/ShippingReturns/shipping';
import MessengerCustomerChat from 'react-messenger-customer-chat';
import PublicRoute from './routes/publicRoute';
import VerificationRoute from './routes/verificationRoute';
import PrivateRoute from './routes/privateRoute';


const App = () => {
  return(<Fragment>
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <div className="content">
          <Switch>
            <PublicRoute exact path="/" component={Home} />
            <PublicRoute exact path="/shop" component={Shop} />
            <PublicRoute exact path="/product/:id" component={ProductDetails} />
            <PublicRoute exact path="/order/:id" component={OrderDetails} />
            <PublicRoute exact path="/checkout" component={Checkout} />
            <PublicRoute exact path="/track" component={TrackOrder} />
            <PublicRoute exact path="/faqs" component={FAQs} />
            <PublicRoute exact path="/shipping" component={ShippingReturns} />
            <PublicRoute exact path="/terms" component={TermsConditions} />
            <VerificationRoute path="/signIn" component={SignIn} />
            <VerificationRoute path="/signUp" component={SignUp} />
            <VerificationRoute path="/forgotPass" component={ForgotPassword} />
            <Route path="/pendingverification" component={PendingVerification} />
            <Route path="/verifyEmail" component={VerifyEmail} />
            <Route path="/resetPassword" component={ResetPassword} />
            <Route path="/verify" component={Verify} />
            <Route path="/paymentVerify/:type" component={PaymentVerify} />
            <PrivateRoute path="/orderHistory" component={OrderHistory} />
            <PrivateRoute path="/changePassword" component={ChangePassword} />
            <Route path="*">
                <Redirect to="/" />
            </Route>
          </Switch>
        </div>
        <Footer /> 
        <MessengerCustomerChat
          pageId="107742277699455"
          appId="375443226860065"
        />
      </AuthProvider>
    </BrowserRouter>

  </Fragment>)
}

export default App;