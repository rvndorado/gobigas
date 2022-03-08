import { combineReducers } from 'redux';

import ProductList from '../components/Shop/reducer/index';
import ProductDetails from '../components/ProductDetails/reducer/index';
import Payment from '../components/Checkout/reducer/index';
import CartList from './features/cart';
import OrderHistory from '../components/OrderHistory/reducer/index';
import OrderDetails from '../components/OrderDetails/reducers/index';

const allReducers = combineReducers({
    products: ProductList,
    product: ProductDetails,
    cart: CartList,
    payment: Payment,
    orderHistory: OrderHistory,
    orderDetails: OrderDetails
});

export default allReducers;