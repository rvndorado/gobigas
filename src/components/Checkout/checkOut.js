import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory } from 'react-router-dom';
import { usePaymentInputs } from 'react-payment-inputs';


import { Container, Col, Row, Card, Accordion as BSAccordion, Form } from 'react-bootstrap';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Button } from 'react-bootstrap';
import MuiPhoneNumber from 'material-ui-phone-number';
import EditIcon from '@material-ui/icons/Edit';
import ItemList from './itemList';
import Alert from '@material-ui/lab/Alert';
import SecureModal from './secureModal';
import GcashModal from './gcashModal';

import { SET_IS_FOR_CHECKOUT, VALIDATE_CART_ITEMS } from '../../reducers/features/cart';
import { COLLECT_PAYMENT } from './reducer/index';
import { Timestamp } from '../../firebase/firebase';



import './checkOut.scss';

const Checkout = () => {
    const { currentUser } = useAuth(); 
    const dispatch = useDispatch();
    const { isForCheckOut  } = useSelector(state => state.cart);
    const { paymentLoading, hasPaymentError, errorDetails } = useSelector(state => state.payment);
    const [currentStep, setCurrentStep] = useState('shipping_info');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [city, setCity] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const history = useHistory();
    const {
        wrapperProps,
        getCardImageProps,
        getCardNumberProps,
        getExpiryDateProps,
        getCVCProps,
        meta
      } = usePaymentInputs();
    const { erroredInputs, touchedInputs } = meta;
    useEffect(() => {
        if(!isForCheckOut) {
            history.push('/');
        }
        else {
            dispatch(SET_IS_FOR_CHECKOUT(false));
        }
    }, []);

    const handlePayment = () => {
        dispatch(VALIDATE_CART_ITEMS());
        const userID = currentUser !== null ? currentUser.uid : '0';
        const orderDetails = {
            contact_number: contactNumber,
            createdBy: currentUser !== null ? currentUser.email : email,
            date: Timestamp.fromDate(new Date()),
            delivery_address: address + ' ' + city,
            email: currentUser !== null ? currentUser.email : email,
            lastUpdateBy: '',
            name: firstName + ' ' + lastName,
            status: 'For Delivery',
        }
        if (paymentMethod === 'card') {
            if(meta.error === undefined) {
                const dateParts = cardExpiry.split(' / ');
                const details = {
                    card_number: cardNumber.replace(/\s/g, ''),
                    exp_month: parseInt(dateParts[0]),
                    exp_year: parseInt('20' + dateParts[1]),
                    cvc: cardCVV
                }
                dispatch(COLLECT_PAYMENT(paymentMethod, details, orderDetails));
            }
        } else {
            dispatch(COLLECT_PAYMENT(paymentMethod, {}, orderDetails));
        }
    }

    const handleChangeCardNumber = (event) => setCardNumber(event.target.value);
    const handleChangeCardExpiry = (event) => setCardExpiry(event.target.value);
    const handleChangeCardCVV = (event) => setCardCVV(event.target.value);

    return(<Fragment>
        <SecureModal />
        <GcashModal />
        <div className="checkout">
            <Container className="checkout__container">
                <Row>
                    <Col md={{ span:'6', order: '1' }} sm={{ span:'12', order: '2' }} xs={{ span:'12', order: '2' }} >
                        <div className="checkout__breadcrumb">
                            <Breadcrumbs aria-label="breadcrumb">
                                <span style={{ color: currentStep === 'cart' ? 'black' : 'inherit' }}>Cart</span>
                                <span style={{ color: currentStep === 'shipping_info' ? 'black' : 'inherit' }}>Shipping Information</span>
                                <span style={{ color: currentStep === 'payment' ? 'black' : 'inherit' }}>Payment</span>
                            </Breadcrumbs>
                        </div>
                        {currentStep === 'shipping_info' ?
                        <div className="checkout__information">
                            <form onSubmit={(e) => e.preventDefault(setCurrentStep('payment'))}>
                                {!currentUser && <Fragment>
                                <span className="h5">Contact Information</span>
                                <TextField 
                                    label="Email" 
                                    variant="outlined"
                                    type="email" 
                                    fullWidth
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ marginBottom: '25px', marginTop: '15px' }}
                                /></Fragment>}

                                <span className="h5">Shipping Information</span>
                                <div className="checkout__information--name">
                                    <TextField 
                                        label="First Name" 
                                        variant="outlined"
                                        required
                                        fullWidth
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        style={{ marginBottom: '25px', marginTop: '15px', marginRight: '10px' }}
                                    />
                                    <TextField 
                                        label="Last Name" 
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        style={{ marginBottom: '20px', marginTop: '15px' }}
                                    />
                                </div>
                                <TextField 
                                    label="Address" 
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    style={{ marginBottom: '25px' }}
                                />
                                <span className="h6">Select City</span>
                                <Select
                                    required
                                    fullWidth
                                    variant="outlined"
                                    style={{ marginBottom: '25px' }}
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                >
                                    <MenuItem value={'Pasig'}>Pasig</MenuItem>
                                    <MenuItem value={'Manila'}>Manila</MenuItem>
                                </Select>
                                <MuiPhoneNumber
                                    label="Mobile Number" 
                                    required={true}
                                    onlyCountries={['ph']}
                                    defaultCountry='ph'
                                    fullWidth
                                    variant="outlined"
                                    value={contactNumber}
                                    onChange={(value) => setContactNumber(value)}
                                    style={{ marginBottom: '25px' }}
                                 />
                                <Button 
                                    variant="outlined" 
                                    className="checkout__information--button"
                                    type="submit"
                                    block={true}
                                >
                                    PROCEED TO PAYMENT
                                </Button>
                            </form>
                        </div> : null}
                        {currentStep === 'payment' ? 
                        <div className="checkout__payment">
                            <Card className="mb-4">
                                <Card.Header className="checkout__payment--header">
                                   <span>Shipping Details</span>
                                   <span style={{ cursor: 'pointer' }} onClick={() => setCurrentStep('shipping_info')} >
                                       <EditIcon />
                                    </span>
                                </Card.Header>
                                <Card.Body>
                                    <div className="checkout__payment--details">
                                        <span className="h6">Email: </span>
                                        <span>{currentUser ? currentUser.email : email}</span>
                                    </div>
                                    <div className="checkout__payment--details">
                                        <span className="h6">Deliver to: </span>
                                        <span>{firstName} {lastName}</span>
                                    </div>
                                    <div className="checkout__payment--details">
                                        <span className="h6">Address: </span>
                                        <span>{address}</span>
                                    </div>                                    
                                    <div className="checkout__payment--details">
                                        <span className="h6">City: </span>
                                        <span>{city}</span>
                                    </div> 
                                    <div className="checkout__payment--details">
                                        <span className="h6">Contact Number: </span>
                                        <span>{contactNumber}</span>
                                    </div> 
                                </Card.Body>
                            </Card>
                            <span className="h5">Payment</span>
                            <br />
                            <span>All transactions are secure and encrypted, Powered by Paymongo</span>
                            {hasPaymentError && <Alert severity="error" style={{ marginBottom: '10px', marginTop: '10px' }}>{errorDetails}</Alert>}
                            <div className="checkout__payment--methods">
                                <form onSubmit={(e) => e.preventDefault(handlePayment())}>
                                    <BSAccordion defaultActiveKey="0">
                                        <Card>
                                            <Card.Header>
                                                <BSAccordion.Toggle as={Button} variant="link" eventKey="0" onClick={() => setPaymentMethod('card')}>
                                                    <span style={{ color: 'black' }}>Credit Card/Debit Card</span>
                                                </BSAccordion.Toggle>
                                            </Card.Header>
                                            <BSAccordion.Collapse eventKey="0">
                                                <Card.Body className="checkout__payment--card">            
                                                    <Form.Label>Card number</Form.Label>
                                                    <Form.Control
                                                        {...getCardNumberProps({
                                                            onChange: handleChangeCardNumber
                                                        })} 
                                                        isInvalid={touchedInputs.cardNumber && erroredInputs.cardNumber}
                                                        placeholder="0000 0000 0000 0000"
                                                        value={cardNumber}
                                                        style={{ marginBottom: '10px' }}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{erroredInputs.cardNumber}</Form.Control.Feedback>
                                                    <Form.Label>Expiry date</Form.Label>
                                                    <Form.Control
                                                        {...getExpiryDateProps({
                                                            onChange: handleChangeCardExpiry
                                                        })} 
                                                        isInvalid={touchedInputs.expiryDate && erroredInputs.expiryDate}
                                                        value={cardExpiry}
                                                        style={{ marginBottom: '10px' }}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{erroredInputs.expiryDate}</Form.Control.Feedback>
                                                    <Form.Label>CVC/CVV</Form.Label>
                                                    <Form.Control
                                                        {...getCVCProps({
                                                            onChange: handleChangeCardCVV
                                                        })} 
                                                        isInvalid={touchedInputs.cvc && erroredInputs.cvc}
                                                        placeholder="123"
                                                        value={cardCVV}
                                                        style={{ marginBottom: '10px' }}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{erroredInputs.cvc}</Form.Control.Feedback>
                                                </Card.Body>
                                            </BSAccordion.Collapse>
                                        </Card>
                                        <Card>
                                            <Card.Header>
                                                <BSAccordion.Toggle as={Button} variant="link" eventKey="1" onClick={() => setPaymentMethod('gcash')}>
                                                    <span style={{ color: 'black' }}>G-CASH</span>
                                                </BSAccordion.Toggle>
                                            </Card.Header>
                                            <BSAccordion.Collapse eventKey="1">
                                                <Card.Body>Click Pay Now and you will be redirected to G-cash to complete the payment.</Card.Body>
                                            </BSAccordion.Collapse>
                                        </Card>
                                    </BSAccordion>
                                    <Button 
                                        variant="outlined" 
                                        className="signin__form--button"
                                        type="submit"
                                        block={true}
                                        style={{ marginTop: '30px' }}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? 'PROCESSING PAYMENT' : 'PAY NOW'}
                                    </Button>
                                </form>
                            </div>
                        </div> : null}
                    </Col>
                    <Col md={{ span:'6', order: '2' }} sm={{ span:'12', order: '1' }} xs={{ span:'12', order: '1' }} className="checkout__list">
                        <Accordion className="d-sm-block d-xs-block d-md-none d-lg-none d-xl-none mb-3">
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="cart-summary-content"
                                id="cart-summary"
                            >
                                <span>Show Order Summary</span>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ItemList />
                            </AccordionDetails>
                        </Accordion>
                        <div className="d-none d-md-block d-lg-block d-xl-block">
                            <ItemList />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    </Fragment>);
}

export default Checkout;