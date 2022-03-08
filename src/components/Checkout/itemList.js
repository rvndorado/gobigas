import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import Badge from '@material-ui/core/Badge';
import { numberWithCommas } from '../../common/common';
import Alert from '@material-ui/lab/Alert';

const ItemList = () => {
    const { cartList  } = useSelector(state => state.cart);
    let subTotal = 0;
    
    return(<Fragment>
        <div className="checkout__list container" style={{ marginTop: '50px' }}>
            <div className="checkout__list--items">
                {cartList.map((cartItem) => {
                    const subAmount = parseFloat(cartItem.quantity) * parseFloat(cartItem.amount);
                    subTotal += subAmount;
                    return(<Fragment key={cartItem.documentID}>
                        {cartItem.hasError && <Alert severity="error" style={{ marginBottom: '25px' }}>{cartItem.hasError}</Alert>}
                        <div className="checkout__list--item">
                            <Badge 
                                badgeContent={cartItem.quantity} 
                                color="primary"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            >
                                <img className="checkout__list--image" src={cartItem.thumbnail} alt="Product Image"/>
                            </Badge>
                            <div className="checkout__list--details">
                                <span className="checkout__list--name">{cartItem.product_name}</span>
                                <span>₱ {numberWithCommas(Number(subAmount).toFixed(2))}</span>
                            </div>  
                        </div>
                    </Fragment>);
                })}
            </div>
            <hr />
            <div className="checkout__list--summary">
                <div className="checkout__list--subtotal">
                <span>SubTotal</span>
                <span>₱ {numberWithCommas(Number(subTotal).toFixed(2))}</span>
            </div>
            <div className="checkout__list--subtotal">
                <span>Shipping</span>
                <span>₱ 0.00</span>
            </div>                            
            </div>
            <hr/>
            <div className="checkout__list--summary">
                <div className="checkout__list--subtotal">
                    <span>Total</span>
                    <span>₱ {numberWithCommas(Number(subTotal).toFixed(2))}</span>
                </div>                           
            </div>
        </div>
    </Fragment>)
}

export default ItemList;