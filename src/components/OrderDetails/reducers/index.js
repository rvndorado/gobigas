import { DockTwoTone } from '@material-ui/icons';
import firebase from '../../../firebase/firebase';

const initialState = {
    orderDetailsLoading: false,
    orderDetails: null,
    hasError: false,
    showRatingModal: false,
    hasRatingError: '',
    ratingLoading: false
}


export const FETCH_ORDER_DETAILS = (orderID) => {
    return async (dispatch) => {
        dispatch({
            type: 'FETCH_ORDER_DETAILS_START'
        }); 

        try {
            let orderDetails = null;
            const orderDetailsRef = firebase.firestore().collection('order_list').doc(orderID);
            const orderDetailsSnapshot = await orderDetailsRef.get();
            if(orderDetailsSnapshot.exists) {
                orderDetails = orderDetailsSnapshot.data();
            }
            dispatch({
                type: 'FETCH_ORDER_DETAILS_END',
                payload: orderDetails
            }); 

        } catch(error) {
            console.log(error);
            dispatch({
                type: 'FETCH_ORDER_DETAILS_FAILED'
            })  
        }

    }
}

export const SUBMIT_RATING = (starRating, feedback, orderID, index) => {
    return async (dispatch, getState) => {
        dispatch({
            type: 'SUBMIT_RATING_START'
        });
        if(starRating === null || feedback === '') {
            dispatch({
                type: 'SUBMIT_RATING_FAILED',
                payload: 'Please select star rating/write something on the feedback textarea.'
            });
        } else {
            try {
                const { orderDetails } = getState();
                const productListRef = firebase.firestore().collection('product_list').where('product_name', '==', orderDetails.orderDetails.order_items[index].product_name);
                const productListSnapshot = await productListRef.get();

                productListSnapshot.forEach(async doc => {
                    const data = doc.data();
                    let feedbackList = [];
                    if(data.feedback_list !== undefined) {
                        feedbackList = data.feedback_list;
                    }
                    feedbackList.push({
                        star: starRating,
                        feedback: feedback
                    });

                    await doc.ref.update({
                        feedback_list: feedbackList
                    });
                });

                orderDetails.orderDetails.order_items[index].hasReview = true;
                const orderDetailsRef = firebase.firestore().collection('order_list').doc(orderID);
                await orderDetailsRef.update({
                    order_items: orderDetails.orderDetails.order_items
                });
                
                dispatch({
                    type: 'SUBMIT_RATING_END'
                });
                dispatch({
                    type: 'SHOW_RATING_MODAL',
                    payload: false
                });
            } catch {
                dispatch({
                    type: 'SUBMIT_RATING_FAILED',
                    payload: 'An error has occured please try again.'
                });
            }
        }
    }
}


export default (state = initialState, action) => {
    switch(action.type) {
        case 'FETCH_ORDER_DETAILS_START' : 
            return {
                ...state,
                orderDetailsLoading: true,
                hasError: false
            }
        case 'FETCH_ORDER_DETAILS_END' : 
            return {
                ...state,
                orderDetailsLoading: false,
                hasError: false,
                orderDetails: action.payload
            }   
        case 'FETCH_ORDER_DETAILS_FAILED' : 
            return {
                ...state,
                orderDetailsLoading: false,
                hasError: true
            }
        case 'SHOW_RATING_MODAL' : 
            return {
                ...state,
                showRatingModal: action.payload,
            } 
        case 'SUBMIT_RATING_START' : 
            return {
                ...state,
                ratingLoading: true,
                hasRatingError: ''
            }
        case 'SUBMIT_RATING_END' : 
            return {
                ...state,
                ratingLoading: false,
                hasRatingError: ''
            }
        case 'SUBMIT_RATING_FAILED' : 
            return {
                ...state,
                ratingLoading: false,
                hasRatingError: action.payload
            }           
        default:
            return state        
    }
}