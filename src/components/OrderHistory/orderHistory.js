import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../AuthContext/AuthContext';

import { Container } from 'react-bootstrap';
import { Grid } from 'gridjs-react';
import './orderHistory.scss';
import 'gridjs/dist/theme/mermaid.css';

import { FETCH_ORDER_HISTORY_LIST } from './reducer/index';



const OrderHistory = () => {
    const dispatch = useDispatch();
    const { currentUser } = useAuth(); 
    const { orderHistory, orderHistoryLoading, hasError, orderHistoryColumns } = useSelector(state => state.orderHistory);

    useEffect(() => {
        const email = currentUser.email;
        dispatch(FETCH_ORDER_HISTORY_LIST(email));
    }, []);

    return(<Fragment>
        <Container>
            <div className="orderhistory">
                <div className="orderhistory__header"><span>MY ORDER HISTORY</span></div>
                <hr />
                <div className="orderhistory__table">
                    {orderHistoryLoading && <span className="orderhistory__table--header">FETCHING ORDER HISTORY</span>}
                    {!orderHistoryLoading && hasError &&<span className="orderhistory__table--header">AN ERROR HAS OCCURED, PLEASE TRY AGAIN</span>}
                    {!orderHistoryLoading && !hasError && orderHistory.length > 0 &&
                    <Grid
                        data={orderHistory}
                        columns={orderHistoryColumns}
                        search={false}
                        pagination={{
                            enabled: true,
                            limit: 5,
                        }}
                    />}
                </div>
            </div>
        </Container>
        
    </Fragment>)
}

export default OrderHistory;