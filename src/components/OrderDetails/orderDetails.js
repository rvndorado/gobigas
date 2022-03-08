import React, { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShippingFast, faTimes, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { numberWithCommas } from '../../common/common';
import { FETCH_ORDER_DETAILS } from './reducers/index';
import { Button } from 'react-bootstrap';
import Badge from '@material-ui/core/Badge';
import RateProduct from './rateProduct';

import './orderDetails.scss';

const OrderDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { orderDetailsLoading, hasError, orderDetails } = useSelector(state => state.orderDetails);
    const [productIndex, setProductIndex] = useState(0);

    useEffect(() => {
        dispatch(FETCH_ORDER_DETAILS(id));
    }, []);

    const showRatingModal = (index) => {
        setProductIndex(index)
        dispatch({
            type: 'SHOW_RATING_MODAL',
            payload: true
        });
    }

    return(<Fragment>
        <RateProduct productIndex={productIndex} />
        <div className="orderDetails container">
            { !orderDetailsLoading && hasError && 
            <Fragment>
                <span><FontAwesomeIcon icon={faTimes} style={{ fontSize: '100px', color: 'red', marginBottom: '20px' }} /></span>
                <div className="orderDetails__header">An Error has occured.</div>   
                <span>Please try to refresh the page, If the issue still exist please contact us for support.</span>
            </Fragment>}

            { !orderDetailsLoading && orderDetails === null && 
            <Fragment>
                <span><FontAwesomeIcon icon={faTimes} style={{ fontSize: '100px', color: 'red', marginBottom: '20px' }} /></span>
                <div className="orderDetails__header">INVALID ORDER NUMBER</div>   
                <span>The order number does not exist.</span>
            </Fragment>}

            { !orderDetailsLoading && orderDetails !== null && 
            <Fragment> 
                {orderDetails.status === 'For Delivery' && <Fragment>
                    <span><FontAwesomeIcon icon={faShippingFast} style={{ fontSize: '100px', color: 'green', marginBottom: '20px' }} /></span>
                    <div className="orderDetails__header">YOUR ORDER IS NOW BEING PROCESSED</div>
                </Fragment>}    
                {orderDetails.status === 'Delivered' && <Fragment>
                    <span><FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: '100px', color: 'green', marginBottom: '20px' }} /></span>
                    <div className="orderDetails__header">THANK YOU FOR YOUR ORDER</div>
                    <span>Items has been delivered.</span>
                </Fragment>}                 
                <br />
                <span>Order Number: {id}</span>
                <span>Deliver To: {orderDetails.name}</span>
                <span>Delivery Address: {orderDetails.delivery_address}</span>
                <br />
                <span>Order Summary</span>
                <div className="orderDetails__list">
                    {orderDetails.order_items.map((item, index) => {
                        const subTotal = parseInt(item.quantity) * parseInt(item.amount);
                        const productOrderIndex = 'orderItem' + index;
                        return (<Fragment key={productOrderIndex}>
                            <div className="orderDetails__list--item">
                                <Badge 
                                    badgeContent={item.quantity} 
                                    color="primary"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                >
                                    <img className="orderDetails__list--image" src={item.thumbnail} alt="Product Image"/>
                                </Badge>
                                <div className="orderDetails__list--details">
                                    <span>{item.product_name}</span>
                                    <span>₱ {numberWithCommas(Number(subTotal).toFixed(2))}</span>
                                    {orderDetails.status === 'Delivered' && !item.hasReview &&
                                    <Button 
                                        variant="warning" 
                                        className="orderDetails__list--button"
                                        block={true}
                                        onClick={() => showRatingModal(index)}
                                    >
                                    Rate Product
                                    </Button>}
                                </div> 
                            </div>
                        </Fragment>)
                    })}
                </div>

                <span className="h5 mb-5">Total Amount: {numberWithCommas(orderDetails.total_amount)}</span>
                
            </Fragment>}
        </div>    
    </Fragment>)
}

export default OrderDetails;