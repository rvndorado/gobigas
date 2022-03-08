import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Modal } from 'react-bootstrap';
import Rating from '@material-ui/lab/Rating';
import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import Alert from '@material-ui/lab/Alert';
import { useParams } from 'react-router-dom';

import { SUBMIT_RATING } from './reducers/index';

import './rateProduct.scss';

const RateProduct = ({ productIndex }) => {
    const { showRatingModal, orderDetails, hasRatingError, ratingLoading } = useSelector(state => state.orderDetails);
    const dispatch = useDispatch();
    const { id } = useParams();
    const [star, setStar] = useState(null);
    const [feedback, setFeedback] = useState('');
    
    const labels = {
        null: 'Please select star rating.',
        1: 'Terrible',
        2: 'Unsatisfied',
        3: 'Satisfied',
        4: 'Very Satisfied',
        5: 'Excellent',
    };

    useEffect(() => {
        setStar(null);
        setFeedback('');
    }, [showRatingModal]);

    const handleHide = () => {
        dispatch({
            type: 'SHOW_RATING_MODAL',
            payload: false
        });
    }

    const handleSubmitFeedback = () => {
        dispatch(SUBMIT_RATING(star, feedback, id, productIndex));
    }

    return(<Fragment>
        {orderDetails !== null &&
        <div className="rating">
            <Modal show={showRatingModal} onHide={handleHide} centered>
                <Modal.Header closeButton>{orderDetails.order_items[productIndex].product_name}</Modal.Header>
                {hasRatingError && <Alert severity="error" style={{ marginTop: '10px' }}>{hasRatingError}</Alert>}
                <Modal.Body>
                    <div className="rating__starpicker">
                        <Rating
                            name="simple-controlled"
                            value={star}
                            onChange={(event, newValue) => {
                                setStar(newValue);
                            }}
                        />
                    </div>
                    <span className="rating__starlabel mb-3">{labels[star]}</span>
                    <TextField 
                        label="Please tell us something about your feedback" 
                        variant="outlined"
                        fullWidth
                        required
                        multiline
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        style={{ marginBottom: '12px' }}
                    />
                    <Button 
                            variant="warning" 
                            className="orderDetails__list--button mb-2"
                            block={true}
                            onClick={handleSubmitFeedback}
                            disabled={ratingLoading}
                        >
                        Submit Rating
                    </Button>
                </Modal.Body>
            </Modal>
        </div>}
    </Fragment>);
}

export default RateProduct;