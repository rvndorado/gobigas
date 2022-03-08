import firebase, { Timestamp } from '../../firebase/firebase';
import axios from 'axios';

const initialState = {
    isDrawerOpen: false,
    cartListLoading: false,
    addToCartLoading: false,
    cartList: [],
    hasError: false,
    addToCartHasError: false,
    updateToCartLoading: false,
    updateToCartHasError: false,
    isForCheckOut: false,
    validateLoading: false
}

export const FETCH_CART_LIST = (userID) => {
    return async (dispatch) => {
        dispatch({
            type: 'FETCH_CART_LIST_START'
        });   

        const cartList = []; 
        try {

            const ipAddress = await axios.get('https://api.ipify.org/?format=json');
            const cartListRef = firebase.firestore().collection('cart_list');
            const cartListQuery = userID === '0' ? cartListRef.where('ip', '==', ipAddress.data.ip).where('status', '==', 'active').orderBy('date', 'desc') : cartListRef.where('uid', '==', userID).where('status', '==', 'active').orderBy('date', 'desc');
            const cartListSnapshot = await cartListQuery.get();

            if(!cartListSnapshot.empty) {
                cartListSnapshot.forEach(doc => {
                    const data = doc.data();
                    Object.assign(data, { 
                        documentID: doc.id,
                        hasError: ''
                    });
                    cartList.push(data);
                });
            }
            dispatch({
                type: 'FETCH_CART_LIST_END',
                payload: cartList
            }); 
        } catch(error) {
            dispatch({
                type: 'FETCH_CART_LIST_FAILED'
            });  
        }

    }
}

export const SET_DRAWER_STATUS = (status) => {
    return async (dispatch) => {
        dispatch({
            type: 'SET_DRAWER_STATUS',
            payload: status
        }); 
    }
}


export const ADD_ITEM_TO_CART = (product) => {
    return async (dispatch) => {
        dispatch({
            type: 'ADD_TO_CART_START'
        });

        try {

            const ipAddress = await axios.get('https://api.ipify.org/?format=json');
            const cartListRef = firebase.firestore().collection('cart_list');
            let cartListQuery = null;
            if(product.uid === '') {
                cartListQuery = cartListRef.where('ip', '==', ipAddress.data.ip).where('status', '==', 'active').where('product_id', '==', product.product_id).orderBy('date', 'desc');
            } else {
                cartListQuery = cartListRef.where('uid', '==', product.uid).where('status', '==', 'active').where('product_id', '==', product.product_id).orderBy('date', 'desc');
            }
            const cartListSnapshot = await cartListQuery.get();

            if(!cartListSnapshot.empty) {
                cartListSnapshot.forEach(async doc => {
                    const data = doc.data();
                    const newQuantity = parseInt(data.quantity) + parseInt(product.quantity);
                    await doc.ref.update({
                        quantity: newQuantity.toString()
                    });
                });

            } else {
                const ipAddress = await axios.get('https://api.ipify.org/?format=json');
                product.date = Timestamp.fromDate(new Date());
                if(product.uid === '') {
                    product.ip = ipAddress.data.ip;
                } else { product.ip = ''; }
                await cartListRef.add(product);
            }

            setTimeout(() => {
                dispatch({
                    type: 'ADD_TO_CART_END',
                });    
            }, 1000);


            dispatch({
                type: 'SET_DRAWER_STATUS',
                payload: true
            }); 

        } catch(error) {
            dispatch({
                type: 'ADD_TO_CART_FAILED'
            });  
        }
    }
}

export const UPDATE_ITEM_TO_CART = (documentID, newQuantity, cartIndex) =>{
    return async (dispatch, getState) => {
        dispatch({
            type: 'UPDATE_TO_CART_START'
        });
        try {
            const cartListRef = firebase.firestore().collection('cart_list').doc(documentID);
            const { cart } = getState();
            const newCartList = cart.cartList;
            if(newQuantity !== '0') {
                await cartListRef.update({ quantity: newQuantity });
                newCartList[cartIndex]['quantity'] = newQuantity;

            } else {
                await cartListRef.update({ status: 'removed' });
                newCartList.splice(cartIndex, 1);
            }

            dispatch({
                type: 'UPDATE_TO_CART_END',
                payload: newCartList
            });

        } catch {
            dispatch({
                type: 'UPDATE_TO_CART_FAILED'
            });  
        }
    }
}

export const VALIDATE_CART_ITEMS = () => {
    return async (dispatch, getState) => {
        const { cart, products } = getState();
        dispatch({
            type: 'VALIDATE_CART_ITEMS_START'
        });

        const validateCartList = cart.cartList;
        const productList = products.productList;
        let isForCheckOut = true;

        validateCartList.map((cart, cartIndex) => {
            const productIndex = productList.findIndex(item => {
                return item['product_name'] === cart['product_name'] && item['remaining'] >= cart.quantity;
            });

            if(productIndex === -1) {
                isForCheckOut = false;
                validateCartList[cartIndex]['hasError'] = 'Insufficient Stocks for this item.'
            } else {
                validateCartList[cartIndex]['hasError'] = '';
            }

        });
        const payload = {
            isForCheckOut: isForCheckOut,
            cartList: validateCartList
        }
        dispatch({
            type: 'VALIDATE_CART_ITEMS_END',
            payload: payload
        });
    }
}

export const SET_IS_FOR_CHECKOUT = (isCheckOut) => {
    return async (dispatch) => {
        dispatch({
            type: 'SET_IS_FOR_CHECKOUT',
            payload: isCheckOut
        });
    }
}


export default (state = initialState, action) => {
    switch(action.type) {
        case 'FETCH_CART_LIST_START' : 
            return {
                ...state,
                cartListLoading: true,
                hasError: false
            }
        case 'FETCH_CART_LIST_END' : 
            return {
                ...state,
                cartListLoading: false,
                hasError: false,
                cartList: action.payload
            }   
        case 'FETCH_CART_LIST_FAILED' : 
            return {
                ...state,
                cartListLoading: false,
                hasError: true
            } 
        case 'SET_DRAWER_STATUS' : 
            return {
                ...state,
                isDrawerOpen: action.payload
            }
        case 'ADD_TO_CART_START' : 
            return {
                ...state,
                addToCartLoading: true,
                addToCartHasError: false
            }
        case 'ADD_TO_CART_END' : 
            return {
                ...state,
                addToCartLoading: false,
                addToCartHasError: false,
                isForCheckOut: false
            } 
        case 'ADD_TO_CART_FAILED' : 
            return {
                ...state,
                addToCartLoading: false,
                addToCartHasError: true,
                isForCheckOut: false
            }    
        case 'UPDATE_TO_CART_START' : 
            return {
                ...state,
                updateToCartLoading: true,
                updateToCartHasError: false
            }
        case 'UPDATE_TO_CART_END' : 
            return {
                ...state,
                cartList: action.payload,
                updateToCartLoading: false,
                updateToCartHasError: false,
                isForCheckOut: false
            } 
        case 'UPDATE_TO_CART_FAILED' : 
            return {
                ...state,
                updateToCartLoading: false,
                updateToCartHasError: true,
                isForCheckOut: false
            }
        case 'VALIDATE_CART_ITEMS_START' : 
            return {
                ...state,
                validateLoading: true,
            }
        case 'VALIDATE_CART_ITEMS_END' : 
            return {
                ...state,
                validateLoading: false,
                isForCheckOut: action.payload.isForCheckOut,
                cartList: action.payload.cartList
            }  
        case 'SET_IS_FOR_CHECKOUT' : 
            return {
                ...state,
                isForCheckOut: action.payload,
            }          
        default:
            return state        
    }
}