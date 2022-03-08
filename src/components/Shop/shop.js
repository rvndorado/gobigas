import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';


import { Container, Col, Row, Image } from 'react-bootstrap';


import { FETCH_PRODUCT_LIST } from './reducer/index';
import { numberWithCommas } from '../../common/common';

import './shop.scss';


const Shop = () => {
    const dispatch = useDispatch();
    const { productList, productListLoading, hasError } = useSelector(state => state.products);

    useEffect(() => {
        dispatch(FETCH_PRODUCT_LIST());
    }, []);

    return(<Fragment>
        <div className="shop">
            {!hasError && <span className="shop__header">{productListLoading ? 'LOADING PRODUCTS' : 'PRODUCTS'}</span>}
            {hasError && !productListLoading && <span className="shop__header">Error Occured, Please try again</span>}
            <Container>
                <Row>
                    {!productListLoading && !hasError && productList.map((product) =>{
                        const url = '/product/' + product['id'];
                        return(<Col key={product.id} lg={3} md={4} sm={12} className="shop__item">
                            <Link to={url}><Image src={product['images'][0]} fluid /></Link>
                            <Link to={url} className="text-link" ><span className="shop__item--productName">{product['product_name']}</span></Link>
                            <span className="shop__item--price">₱ {numberWithCommas(Number(product['amount']).toFixed(2))}</span>
                        </Col>);
                    })}
                </Row>
            </Container>
        </div>

    </Fragment>);
}

export default Shop;