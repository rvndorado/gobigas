import firebase from '../../../firebase/firebase';


const initialState = {
    productLoading: false,
    product: null,
    hasError: false
}

export const FETCH_PRODUCT_DETAILS = (productID) => {
    return async (dispatch) => {
        dispatch({
            type: 'FETCH_PRODUCT_START'
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
    
            let product = null;
            const productRef = firebase.firestore().collection('product_list').doc(productID);
            const productSnapshot = await productRef.get();

            const data = productSnapshot.data();
            const stockIndex = stockList.findIndex(item => {
                return item['product_name'] === data['product_name'] && item['remaining'] > 0
            });

            if(stockIndex !== null) {
                const images = [];
                Object.assign(data, { 
                    remaining: stockList[stockIndex]['remaining'],
                    id: productSnapshot.id
                });
                data.images.forEach((image) => {
                    images.push({ original: image, thumbnail: image });
                });

                data.images = images;
                product = data;
            }

            dispatch({
                type: 'FETCH_PRODUCT_END',
                payload: product
            }); 

        } catch(error) {
            dispatch({
                type: 'FETCH_PRODUCT_FAILED'
            });  
        }

    }
}


export default (state = initialState, action) => {
    switch(action.type) {
        case 'FETCH_PRODUCT_START' : 
            return {
                ...state,
                productLoading: true,
                hasError: false
            }
        case 'FETCH_PRODUCT_END' : 
            return {
                ...state,
                productLoading: false,
                hasError: false,
                product: action.payload
            }   
        case 'FETCH_PRODUCT_FAILED' : 
            return {
                ...state,
                productLoading: false,
                hasError: true
            }         
        default:
            return state        
    }
}