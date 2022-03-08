import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { Modal } from 'react-bootstrap';
import { SHOW_3DS_MODAL, CREATE_ORDER } from './reducer/index';

const SecureModal = () => {
    const dispatch = useDispatch();
    const { show3DSModal, show3DSLink, show3DSDetails, paymentLoading } = useSelector(state => state.payment);

    useEffect(() => {
        if(Object.entries(show3DSDetails).length !== 0) {
            window.addEventListener(
                'message',
                async ev => {
                    if (ev.data === '3DS-authentication-complete') {
                        const secretApiKey = process.env.REACT_APP_PAYMONGO_SECRET_KEY;
                        try {
                            const paymentIntent = await axios.get('https://api.paymongo.com/v1/payment_intents/' + show3DSDetails.paymentIntentID + '?client_key=' + show3DSDetails.client_key,
                                {
                                    headers: {
                                        // Base64 encoded public PayMongo API key.
                                        Authorization: `Basic ${window.btoa(secretApiKey)}`
                                    }
                                }
                            );
                            const paymentIntentData = paymentIntent.data.data;
                            if(paymentIntent.status !== 200) {
                                const errorCode = paymentIntentData.errors[0]['sub_code'];
                                let errorDetails = 'An error has occured, please try again.';
                                if(errorCode === 'card_expired') errorDetails = paymentIntentData.errors[0]['detail'];
                                if(errorCode === 'cvc_invalid') errorDetails = 'Invalid CVV/CVC number.'
                                if(errorCode === 'generic_decline') errorDetails = paymentIntentData.errors[0]['detail'];
                                if(errorCode === 'insufficient_funds') errorDetails = paymentIntentData.errors[0]['detail'];
                                dispatch({
                                    type: 'FAILED_PAYMENT',
                                    payload: errorDetails
                                });
                                return;
                            } else {
                                const paymentStatus = paymentIntentData.attributes.status;
                                if (paymentStatus === 'succeeded') {
                                    dispatch(CREATE_ORDER(show3DSDetails.orderDetails,show3DSDetails.orderItems, show3DSDetails.totalAmount));
                                } else if(paymentStatus === 'awaiting_payment_method') {
                                    const errorDetails = paymentIntentData.attributes.last_payment_error.failed_message
                                    dispatch({
                                        type: 'FAILED_PAYMENT',
                                        payload: errorDetails
                                    });
                                } else if(paymentStatus === 'processing') {
                                    setTimeout(async() => {
                                        const paymentIntent = await axios.get('https://api.paymongo.com/v1/payment_intents/' + show3DSDetails.paymentIntentID+ '?client_key=' + show3DSDetails.client_key,
                                            {
                                            headers: {
                                                // Base64 encoded public PayMongo API key.
                                                Authorization: `Basic ${window.btoa(secretApiKey)}`
                                            }
                                            }
                                        );
                                        const paymentIntentData = paymentIntent.data.data;
                                        if(paymentIntent.status !== 200) {
                                            const errorCode = paymentIntentData.errors[0]['sub_code'];
                                            let errorDetails = 'An error has occured, please try again.';
                                            if(errorCode === 'card_expired') errorDetails = paymentIntentData.errors[0]['detail'];
                                            if(errorCode === 'cvc_invalid') errorDetails = 'Invalid CVV/CVC number.'
                                            if(errorCode === 'generic_decline') errorDetails = paymentIntentData.errors[0]['detail'];
                                            if(errorCode === 'insufficient_funds') errorDetails = paymentIntentData.errors[0]['detail'];
                                            dispatch({
                                                type: 'FAILED_PAYMENT',
                                                payload: errorDetails
                                            });
                                            return;
                                        } else {
                                            const paymentStatus = paymentIntentData.attributes.status;
                                            if (paymentStatus === 'succeeded') {
                                                dispatch(CREATE_ORDER(show3DSDetails.orderDetails,show3DSDetails.orderItems, show3DSDetails.totalAmount));
                                            } else if(paymentStatus === 'awaiting_payment_method') {
                                                const errorDetails = paymentIntentData.attributes.last_payment_error.failed_message
                                                dispatch({
                                                    type: 'FAILED_PAYMENT',
                                                    payload: errorDetails
                                                });
                                            } else {
                                                dispatch({
                                                    type: 'FAILED_PAYMENT',
                                                    payload: 'An error has occured, please try again.'
                                                });
                                            }
                                        }
                                      }, 3000);
                                }
                            }
                        } catch(error) {
                            dispatch({
                                type: 'FAILED_PAYMENT',
                                payload: 'An error has occured, please try again.'
                            });
                        }

                    }
                },
                false
              );
        }

    }, [show3DSDetails]);

    const handleHide = () => {
        if(paymentLoading) {
            dispatch({
                type: 'FAILED_PAYMENT',
                payload: 'Please authenticate in order to confirm payment.'
            });
        }
        dispatch(SHOW_3DS_MODAL(false));
    }

    return(<Fragment>
        <Modal show={show3DSModal} onHide={handleHide} backdrop="static" keyboard={false}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <iframe src={show3DSLink} width="100%" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </Modal.Body>
        </Modal>
    </Fragment>);
}

export default SecureModal;