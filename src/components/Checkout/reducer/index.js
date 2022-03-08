import firebase from '../../../firebase/firebase';
import Swal from 'sweetalert2';
import axios from 'axios';
import emailjs from 'emailjs-com';
import { numberWithCommas } from '../../../common/common';


const initialState = {
    paymentLoading: false,
    hasPaymentError: false,
    errorDetails: '',
    show3DSModal: false,
    show3DSLink: '',
    show3DSDetails: {},
    showGcashModal: false,
    showGcashDetails: {}
}

export const COLLECT_PAYMENT = (paymentMethod, cardDetails, orderDetails) => {
    return async (dispatch, getState) => {
        const { cart } = getState();
        let totalAmount = 0;
        let hasError = false;
        const orderItems = [];
        const secretApiKey = process.env.REACT_APP_PAYMONGO_SECRET_KEY;
        const publicApiKey = process.env.REACT_APP_PAYMONGO_SECRET_KEY;

        dispatch({
            type: 'START_PAYMENT'
        });         

        cart.cartList.map((cartItem) => {
            if(cartItem.hasError !== '') {
                dispatch({
                    type: 'FAILED_PAYMENT',
                    payload: 'Insufficient stocks to checkout.'
                });
                hasError = true;
            } else {
                const subAmount = parseFloat(cartItem.quantity) * parseFloat(cartItem.amount);
                totalAmount += subAmount;

                orderItems.push({
                    product_name: cartItem.product_name,
                    amount: cartItem.amount,
                    quantity: cartItem.quantity,
                    thumbnail: cartItem.thumbnail,
                    hasReview: false
                });
            }

        });
 
        try {
            if(paymentMethod === 'card' && !hasError) {
                const paymentIntenOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Basic ${window.btoa(secretApiKey)}`
                      },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                          amount: totalAmount*100,
                          payment_method_allowed: ['card'],
                          payment_method_options: {card: {request_three_d_secure: 'any'}},
                          currency: 'PHP'
                        }
                      }
                    })
                };
                const paymentIntent = await fetch('https://api.paymongo.com/v1/payment_intents', paymentIntenOptions);
                const paymentIntentData = await paymentIntent.json();
                if(paymentIntent.ok === false) {
                    const errorDetails = paymentIntentData.errors[0]['detail'];
                    dispatch({
                        type: 'FAILED_PAYMENT',
                        payload: errorDetails
                    });
                    return;
                }
                const client_key = paymentIntentData.data.attributes.client_key;
                
                const paymentMethodOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Basic ${window.btoa(publicApiKey)}`
                      },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                            type: 'card',
                            details: cardDetails
                        }
                      }
                    })
                };

                const paymentMethod = await fetch('https://api.paymongo.com/v1/payment_methods', paymentMethodOptions);
                const paymentMethodData = await paymentMethod.json();
                if(paymentMethod.ok === false) {
                    const errorDetails = paymentMethodData.errors[0]['detail'];
                    dispatch({
                        type: 'FAILED_PAYMENT',
                        payload: errorDetails
                    });
                    return;
                }

                const attachPaymentIntentOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Basic ${window.btoa(secretApiKey)}`
                      },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                            payment_method: paymentMethodData.data.id,
                            client_key: client_key
                        }
                      }
                    })
                };
                const attachPaymentIntentURL = 'https://api.paymongo.com/v1/payment_intents/' + paymentIntentData.data.id + '/attach'
                const attachPaymentIntent = await fetch(attachPaymentIntentURL, attachPaymentIntentOptions);
                const attachPaymentIntentData = await attachPaymentIntent.json();
                if(attachPaymentIntent.ok === false) {
                    const errorCode = attachPaymentIntentData.errors[0]['sub_code'];
                    let errorDetails = 'An error has occured, please try again.';
                    if(errorCode === 'card_expired') errorDetails = attachPaymentIntentData.errors[0]['detail'];
                    if(errorCode === 'cvc_invalid') errorDetails = 'Invalid CVV/CVC number.'
                    if(errorCode === 'generic_decline') errorDetails = attachPaymentIntentData.errors[0]['detail'];
                    if(errorCode === 'insufficient_funds') errorDetails = attachPaymentIntentData.errors[0]['detail'];
                    dispatch({
                        type: 'FAILED_PAYMENT',
                        payload: errorDetails
                    });
                    return;
                } else {
                    const paymentStatus = attachPaymentIntentData.data.attributes.status;
                    if (paymentStatus === 'awaiting_next_action') {
                        const details3DS = {
                            client_key: client_key,
                            paymentMethodID: paymentMethodData.data.id,
                            paymentIntentID: paymentIntentData.data.id,
                            orderDetails: orderDetails,
                            orderItems: orderItems,
                            totalAmount: totalAmount
                        }
                        dispatch({
                            type: 'SET_3DS_DETAILS',
                            payload: details3DS
                        });
                        dispatch({
                            type: 'SET_3DS_LINK',
                            payload: attachPaymentIntentData.data.attributes.next_action.redirect.url
                        });
                        dispatch({
                            type: 'SHOW_3DS_MODAL',
                            payload: true
                        });
                      } else if (paymentStatus === 'succeeded') {
                        dispatch(CREATE_ORDER(orderDetails,orderItems, totalAmount));
                      } else if(paymentStatus === 'awaiting_payment_method') {
                        dispatch({
                            type: 'FAILED_PAYMENT',
                            payload: 'An error has occured, please try again or use another card.'
                        });
                      }  else if (paymentStatus === 'processing') {
                          setTimeout(async() => {
                            const paymentIntent = await axios.get('https://api.paymongo.com/v1/payment_intents/' + paymentIntentData.data.id + '?client_key=' + client_key,
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
                                    dispatch(CREATE_ORDER(orderDetails, orderItems, totalAmount));
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
                      } else {
                        dispatch({
                            type: 'FAILED_PAYMENT',
                            payload: 'An error has occured, please try again.'
                        });
                      }
                }             
               
            } else {
                //gcash
                const createSourceOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Basic ${window.btoa(secretApiKey)}`
                      },
                    body: JSON.stringify({
                      data: {
                        attributes: {
                            type: 'gcash',
                            amount: totalAmount*100,
                            redirect: {
                                success: 'http://localhost:3000/paymentVerify/success',
                                failed: 'http://localhost:3000/paymentVerify/failed'
                            },
                            currency: 'PHP'
                        }
                      }
                    })
                };
                const createSource = await fetch('https://api.paymongo.com/v1/sources', createSourceOptions);
                const createSourceData = await createSource.json();
                if(createSource.ok === false) {
                    dispatch({
                        type: 'FAILED_PAYMENT',
                        payload: 'An error has occured, please try again.'
                    });
                    return;
                } else {
                    const sourceID = createSourceData.data.id;
                    const checkOutURL = createSourceData.data.attributes.redirect.checkout_url;
                    const gcashDetails = {
                        sourceID: sourceID,
                        checkOutURL: checkOutURL,
                        orderDetails: orderDetails,
                        orderItems: orderItems,
                        totalAmount: totalAmount
                    }
                    dispatch({
                        type: 'SHOW_GCASH_MODAL',
                        payload: true
                    });
                    dispatch({
                        type: 'SET_GCASH_DETAILS',
                        payload: gcashDetails
                    });
                }
            } 
        } catch(error) {
            dispatch({
                type: 'FAILED_PAYMENT',
                payload: 'An error has occured, please try again.'
            });
        }

    }
}

export const VERIFY_GCASH_PAYMENT = () => {
    return async (dispatch, getState) => {
        const { payment } = getState();
        const secretApiKey = process.env.REACT_APP_PAYMONGO_SECRET_KEY;
        try {
            const URL = 'https://api.paymongo.com/v1/sources/' + payment.showGcashDetails.sourceID;
            const paymentSource = await axios.get(URL, 
                {
                    headers: {
                        // Base64 encoded public PayMongo API key.
                        Authorization: `Basic ${window.btoa(secretApiKey)}`
                    }
                }
            );
            if(paymentSource.status === 200) {
                const paymentStatus = paymentSource.data.data.attributes.status;
                if(paymentStatus === 'chargeable') {
                    const createPaymentOptions = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            Authorization: `Basic ${window.btoa(secretApiKey)}`
                          },
                        body: JSON.stringify({
                          data: {
                            attributes: {
                              amount: payment.showGcashDetails.totalAmount*100,
                              description: 'Gobigas Order Payment',
                              currency: 'PHP',
                              source: {
                                  id: payment.showGcashDetails.sourceID,
                                  type: 'source'
                              }
                            }
                          }
                        })
                    };
                    const createPayment = await fetch('https://api.paymongo.com/v1/payments', createPaymentOptions);
                    const createPaymentData = await createPayment.json();
                    if(createPayment.ok === false) {
                        dispatch({
                            type: 'FAILED_PAYMENT',
                            payload: 'An error has occured, please try again.'
                        });
                        return;
                    } else {
                        const createPaymentStatus = createPaymentData.data.attributes.status;
                        if(createPaymentStatus === 'paid') {
                            dispatch(CREATE_ORDER(payment.showGcashDetails.orderDetails,payment.showGcashDetails. orderItems, payment.showGcashDetails.totalAmount));
                        } else {
                            dispatch({
                                type: 'FAILED_PAYMENT',
                                payload: 'Payment Authentication Failed.'
                            });
                            return;
                        }
                    }
                } else {
                    dispatch({
                        type: 'FAILED_PAYMENT',
                        payload: 'Payment Authentication Failed.'
                    });                      
                }
            } else {
                dispatch({
                    type: 'FAILED_PAYMENT',
                    payload: 'An error has occured, please try again.'
                });  
            }
        } catch(error) {
            dispatch({
                type: 'FAILED_PAYMENT',
                payload: 'An error has occured, please try again.'
            });
        }
    }
}


export const SHOW_3DS_MODAL = (show) => {
    return async (dispatch) => {
        dispatch({
            type: 'SHOW_3DS_MODAL',
            payload: show
        });
    }
}

export const CREATE_ORDER = (orderDetails, orderItems, totalAmount) => {
    return async (dispatch, getState) => {
        try {
            const { cart } = getState();
            const cartList = cart.cartList;

            cartList.forEach(async (cartItem) => {
                const cartListRef = firebase.firestore().collection('cart_list').doc(cartItem.documentID);
                const stockListRef = firebase.firestore().collection('stock_list').where('product_name', '==', cartItem.product_name).where('remaining', '>=', parseInt(cartItem.quantity));
                const stockListSnapshot = await stockListRef.get();
                await cartListRef.update({ status: 'checkout' });
                if(!stockListSnapshot.empty) {
                    stockListSnapshot.forEach(async (doc) => {
                        const data = doc.data();
                        const updatedQuantity = data.remaining - parseInt(cartItem.quantity);
                        const updatedSold = data.sold + parseInt(cartItem.quantity);
                        await doc.ref.update({ remaining: updatedQuantity, sold: updatedSold });
                    });
                }

            });

            Object.assign(orderDetails, {
                total_amount: totalAmount,
                order_items: orderItems
            });
            
            const orderListRef = firebase.firestore().collection('order_list');
            const orderResponse = await orderListRef.add(orderDetails);
            const orderID = orderResponse.id;
            Swal.fire(
                'Success!',
                'Transaction Completed, A email will be sent for order confirmation and status.',
                'success'
            ).then(async() => {
                const emailParams = {
                    orderID: orderID,
                    fullName: orderDetails.name,
                    address: orderDetails.delivery_address,
                    totalAmount: numberWithCommas(Number(totalAmount).toFixed(2)),
                    email: orderDetails.email,
                    orderLink: 'http://localhost:3000/order/' + orderID
                }
                try {
                    await emailjs.send(
                        process.env.REACT_APP_EMAILJS_SERVICE_ID, 
                        process.env.REACT_APP_EMAILJS_TEMPLATE_ID, 
                        emailParams,
                        process.env.REACT_APP_EMAILJS_USER_ID);
                    window.location = '/order/' + orderID;
                } catch(error) {
                    console.log(error);
                }
            });

            dispatch({
                type: 'END_PAYMENT'
            }); 
        } catch {
            dispatch({
                type: 'FAILED_PAYMENT',
                payload: 'Something went wrong please contact support.'
            });            
        }
    }
}

export default (state = initialState, action) => {
    switch(action.type) {
        case 'START_PAYMENT' : 
            return {
                ...state,
                paymentLoading: true,
                hasPaymentError: false,
                showGcashModal: false,
                showGcashDetails: {},
                errorDetails: ''
            }
        case 'END_PAYMENT' : 
            return {
                ...state,
                paymentLoading: false,
                hasPaymentError: false,
                errorDetails: ''
            }   
        case 'FAILED_PAYMENT' : 
            return {
                ...state,
                paymentLoading: false,
                hasPaymentError: true,
                errorDetails: action.payload
            }
        case 'SHOW_3DS_MODAL' : 
            return {
                ...state,
                show3DSModal: action.payload
            }
        case 'SET_3DS_LINK' : 
            return {
                ...state,
                show3DSLink: action.payload
            } 
        case 'SET_3DS_DETAILS' : 
            return {
                ...state,
                show3DSDetails: action.payload
            } 
        case 'SHOW_GCASH_MODAL' : 
            return {
                ...state,
                showGcashModal: action.payload
            }
        case 'SET_GCASH_DETAILS' : 
            return {
                ...state,
                showGcashDetails: action.payload
            }     
        default:
            return state        
    }
}