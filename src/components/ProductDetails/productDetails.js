import React, { Fragment, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../AuthContext/AuthContext'; 
import { Link } from 'react-router-dom';

import { FETCH_PRODUCT_DETAILS } from './reducer/index';
import { ADD_ITEM_TO_CART } from '../../reducers/features/cart';
import { numberWithCommas } from '../../common/common';

import { Container, Col, Row } from 'react-bootstrap';
import ImageGallery from 'react-image-gallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import Alert from '@material-ui/lab/Alert';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import RatingList from './ratingList';

import './productDetails.scss';
import './../../../node_modules/react-image-gallery/styles/scss/image-gallery.scss';



const ProductDetails = () => {
    const history = useHistory();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentUser } = useAuth(); 
    const { product, productLoading, hasError } = useSelector(state => state.product);
    const { addToCartLoading, addToCartHasError } = useSelector(state => state.cart);
    const [quantity, setQuantity] = useState(1);


    useEffect(() =>{
        if(id === null) {
            history.push('/');
        } else { dispatch(FETCH_PRODUCT_DETAILS(id)); }
    }, []);

    const handleSubmit = async (e) => { 
        e.preventDefault();
        const userID = currentUser !== null ? currentUser.uid : '';
        const productToAdd = {
            amount: product['amount'],
            product_id: product['id'],
            product_name: product['product_name'],
            quantity: quantity,
            status: 'active',
            thumbnail: product['images'][0]['thumbnail'],
            uid: userID
        }
        dispatch(ADD_ITEM_TO_CART(productToAdd));
    }

    return(<Fragment>
        <div className="productdetails">
            {productLoading && <span className="productdetails__header">LOADING PRODUCT DETAILS</span>}
            {!productLoading && !product && <span className="productdetails__header">PRODUCT DOES NOT EXIST</span>}
            
            {!productLoading && product && !hasError && 
            <Container>
                <Breadcrumbs aria-label="breadcrumb" className="productdetails__breadcrumbs">
                    <Link to="/shop" className="text-link" style={{ color: 'inherit' }}><span>Shop</span></Link>
                    <span style={{ color: 'black' }}>{product['product_name']}</span>
                </Breadcrumbs>
                <Row>
                    <Col md={6} sm={12} className="productdetails__gallery">
                        <ImageGallery 
                            items={product['images']}
                            thumbnailPosition={window.screen.width <= 425 ? 'bottom' : 'left'}
                            showPlayButton={false}
                            showNav={false}
                            showBullets={true}
                        />
                    </Col>
                    <Col md={6} sm={12} className="productdetails__details">
                        <span className="productdetails__details--name">{product['product_name']}</span>
                        <span className="productdetails__details--amount">₱ {numberWithCommas(Number(product['amount']).toFixed(2))}</span>
                        <hr style={{ width: '100%' }} />
                        <p className="productdetails__details--description">{product['description']}</p>
                        <hr style={{ width: '100%' }} />
                        <div className="productdetails__form">
                            {addToCartHasError && <Alert severity="error" style={{ marginBottom: '25px' }}>An error has occured, Please try again.</Alert>}
                            <form autoComplete="off" onSubmit={handleSubmit}>
                                <TextField 
                                    label="Quantity" 
                                    variant="outlined"
                                    type="number" 
                                    InputProps={{ inputProps: { min: 1, max: product['remaining'] } }}
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    style={{ marginBottom: '10px', width: '150px' }}
                                />
                               <Button 
                                    variant="outlined" 
                                    className="productdetails__form--button"
                                    type="submit"
                                    disabled={addToCartLoading}
                                    block={true}
                                >
                                    {!addToCartLoading ? <span><FontAwesomeIcon icon={faCartPlus} /> ADD TO CART</span> : <span><FontAwesomeIcon icon={faCartPlus} /> ADDING TO CART</span>}
                                </Button>
                            </form>
                        </div>
                    </Col>
                </Row>
                <RatingList />
            </Container>}
        </div>
        
    </Fragment>);
}

export default ProductDetails;