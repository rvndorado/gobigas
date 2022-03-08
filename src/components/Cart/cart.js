import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../AuthContext/AuthContext';
import { useDebouncedCallback } from 'use-lodash-debounce';
import { useHistory } from 'react-router-dom';


import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Swal from 'sweetalert2';
import Alert from '@material-ui/lab/Alert';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import { SET_DRAWER_STATUS, FETCH_CART_LIST, UPDATE_ITEM_TO_CART, VALIDATE_CART_ITEMS } from '../../reducers/features/cart';
import { FETCH_PRODUCT_LIST } from '../../components/Shop/reducer/index';
import { numberWithCommas } from '../../common/common';

import './cart.scss';


const Cart = () => {
    const { currentUser } = useAuth(); 
    const dispatch = useDispatch();
    const history = useHistory();
    const { cartList, cartListLoading, hasError, validateLoading, isForCheckOut, isDrawerOpen } = useSelector(state => state.cart);
    const { productList } = useSelector(state => state.products);
    let subTotal = 0;

    useEffect(() =>{
        const userID = currentUser !== null ? currentUser.uid : '0';
        dispatch(FETCH_CART_LIST(userID));
        if(productList.length === 0) {
            dispatch(FETCH_PRODUCT_LIST());
        }   
    }, []);

    const handleUpdateQuantity = (documentID, newQuantity, cartIndex) => {
        if(newQuantity !== '0') {
            dispatch(UPDATE_ITEM_TO_CART(documentID, newQuantity, cartIndex));
        } else {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to remove this item from your cart.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, remove it!'
              }).then((result) => {
                if (result.isConfirmed) {
                    dispatch(UPDATE_ITEM_TO_CART(documentID, newQuantity, cartIndex)); 
                } else {
                    dispatch(UPDATE_ITEM_TO_CART(documentID, '1', cartIndex));
                }
              });
        }
        
    }
    const debouncedUpdateQuantity = useDebouncedCallback(handleUpdateQuantity, 500);

    const handleValidate = () => {
        dispatch(VALIDATE_CART_ITEMS());
    }

    useEffect(() => {
if(isForCheckOut) {
    history.push('/checkout');
    dispatch(SET_DRAWER_STATUS(false));
}
    }, [isForCheckOut])

    return(<Fragment>
        <div className="cart">
            <div className="cart__header">
                <span className="cart__header--text"><ShoppingCartOutlinedIcon /> MY CART</span>
                <span className="cart__header--close" onClick={() => dispatch(SET_DRAWER_STATUS(false))}>X</span>               
            </div>
            <hr style={{ width: '100%' }} />
            <div className="cart__list">
                {cartListLoading && <span className="cart__list--header">LOADING CART</span>}
                {!cartListLoading && hasError && <span className="cart__list--header">AN ERROR OCCURED PLEASE TRY AGAIN.</span>}
                {!cartListLoading && !hasError && cartList.length == 0 && <span className="cart__list--header">CART IS CURRENTLY EMPTY.</span>}
                {!cartListLoading && !hasError && cartList.length > 0 && 
                <Fragment>
                    <div className="cart__list--items">
                        {cartList.map((cartItem, cartIndex) => {
                            const subAmount = parseFloat(cartItem.quantity) * parseFloat(cartItem.amount);
                            subTotal += subAmount;
                            return(<Fragment key={cartItem.documentID}>
                                {cartItem.hasError && <Alert severity="error" style={{ marginBottom: '25px' }}>{cartItem.hasError}</Alert>}
                                <div className="cart__list--item">
                                    <img className="cart__list--image" src={cartItem.thumbnail} alt="Product Image"/>
                                    <div className="cart__list--details">
                                        <span className="cart__list--name">{cartItem.product_name}</span>
                                        <span>₱ {numberWithCommas(Number(subAmount).toFixed(2))}</span>
                                    </div> 
                                    <div className="cart__list--controls">
                                        <TextField 
                                            variant="outlined"
                                            type="number" 
                                            size="small"
                                            defaultValue={cartItem.quantity}
                                            onChange={(e) => debouncedUpdateQuantity(cartItem.documentID, e.target.value, cartIndex)}
                                            InputProps={{ inputProps: { min: 0, max: 999 } }}
                                            style={{ width: '60px' }}
                                        />
                                        <span onClick={() => debouncedUpdateQuantity(cartItem.documentID, '0', cartIndex)}>Remove</span>
                                    </div>  
                                </div>  
                            </Fragment>);
                        })}
                
                    </div>
                    <div className="cart__list--summary">
                        <div className="cart__list--subtotal">
                            <span>SubTotal</span>
                            <span>₱ {numberWithCommas(Number(subTotal).toFixed(2))}</span>
                        </div>
                        <Button 
                            variant="outlined" 
                            className="signin__form--button"
                            block={true}
                            disabled={validateLoading}
                            onClick={handleValidate}
                        >
                            {!validateLoading ? 'CHECKOUT' : 'VALIDATING CART ITEMS'}
                        </Button>                   
                    </div>
                </Fragment>}
            </div>
        </div>
    </Fragment>);
}

export default Cart;