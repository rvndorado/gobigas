import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { Modal } from 'react-bootstrap';
import { VERIFY_GCASH_PAYMENT } from './reducer/index';

const GcashModal = () => {
    const dispatch = useDispatch();
    const { showGcashModal, showGcashDetails } = useSelector(state => state.payment);

    const handleHide = () => {
        dispatch({
            type: 'SHOW_GCASH_MODAL',
            payload: false
        });
        
        dispatch(VERIFY_GCASH_PAYMENT());
    }

    return(<Fragment>
        <Modal show={showGcashModal} onHide={handleHide} backdrop="static" keyboard={false}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <iframe src={showGcashDetails.checkOutURL} width="100%" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </Modal.Body>
        </Modal>
    </Fragment>);
}


export default GcashModal;