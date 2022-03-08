import firebase from '../../../firebase/firebase';

const initialState = {
    productListLoading: false,
    productList: [],
    hasError: false
}

export const FETCH_PRODUCT_LIST = () => {
    return async (dispatch) => {
        dispatch({
            type: 'FETCH_PRODUCT_LIST_START'
        });   
        
        try {
            const stockList = [];
            const stockListRef = firebase.firestore().collection('stock_list');
            const stockListQuery = stockListRef.orderBy('date', 'desc');
            const stockListSnapshot = await stockListQuery.get();
    
            stockListSnapshot.forEach(doc => {
                const data = doc.data();
                stockList.push(data);
            });
    
            const productList = [];
            const productListRef = firebase.firestore().collection('product_list');
            const productListQuery = productListRef.orderBy('date', 'desc');
            const productListSnapshot = await productListQuery.get();
    
            productListSnapshot.forEach(doc => {
                const data = doc.data();
                const stockIndex = stockList.findIndex(item => {
                    return item['product_name'] === data['product_name'] && item['remaining'] > 0
                });
                
                if(stockIndex !== -1) {
                    Object.assign(data, { 
                        remaining: stockList[stockIndex]['remaining'],
                        id: doc.id
                    });
                    productList.push(data);
                }
    
            });
            dispatch({
                type: 'FETCH_PRODUCT_LIST_END',
                payload: productList
            }); 

        } catch(error) {
            dispatch({
                type: 'FETCH_PRODUCT_LIST_FAILED'
            });  
        }

    }
}


export default (state = initialState, action) => {
    switch(action.type) {
        case 'FETCH_PRODUCT_LIST_START' : 
            return {
                ...state,
                productListLoading: true,
                hasError: false
            }
        case 'FETCH_PRODUCT_LIST_END' : 
            return {
                ...state,
                productListLoading: false,
                hasError: false,
                productList: action.payload
            }   
        case 'FETCH_PRODUCT_LIST_FAILED' : 
            return {
                ...state,
                productListLoading: false,
                hasError: true
            }         
        default:
            return state        
    }
}