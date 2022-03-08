import firebase from '../../../firebase/firebase';
import { _ } from 'gridjs-react';
import { numberWithCommas } from '../../../common/common';

const initialState = {
    orderHistoryLoading: false,
    orderHistory: [],
    hasError: false,
    orderHistoryColumns: [
        {
            id: 'documentID',
            name: 'Order ID'
        },
        {
            id: 'total_amount',
            name: 'Total Amount',
            formatter: (cell) => numberWithCommas(cell)
        },
        {
            id: 'status',
            name: 'Order Status'
        }
    ]
}


export const FETCH_ORDER_HISTORY_LIST = (email) => {
    return async (dispatch) => {
        dispatch({
            type: 'FETCH_ORDER_HISTORY_LIST_START'
        });   

        try {
            const orderList = [];
            const orderListRef = firebase.firestore().collection('order_list').where('email', '==', email).orderBy('date', 'desc');
            const orderListSnapshot = await orderListRef.get();
            if(!orderListSnapshot.empty) {
                orderListSnapshot.forEach(doc => {
                    const documentID = doc.id;
                    const data = doc.data();
                    const hrefLink = '/order/' + doc.id;
                    orderList.push(Object.assign({
                        documentID: _(<a href={hrefLink} target="_blank">{documentID}</a>),
                    }, data));
                });               
            }
            dispatch({
                type: 'FETCH_ORDER_HISTORY_LIST_END',
                payload: orderList
            });   
    


        } catch(error) {
            console.log(error);
            dispatch({
                type: 'FETCH_ORDER_HISTORY_LIST_FAILED'
            });  
        }
        

    }
}



export default (state = initialState, action) => {
    switch(action.type) {
        case 'FETCH_ORDER_HISTORY_LIST_START' : 
            return {
                ...state,
                orderHistoryLoading: true,
                hasError: false
            }
        case 'FETCH_ORDER_HISTORY_LIST_END' : 
            return {
                ...state,
                orderHistoryLoading: false,
                hasError: false,
                orderHistory: action.payload
            }   
        case 'FETCH_ORDER_HISTORY_LIST_FAILED' : 
            return {
                ...state,
                orderHistoryLoading: false,
                hasError: true
            }         
        default:
            return state        
    }
}