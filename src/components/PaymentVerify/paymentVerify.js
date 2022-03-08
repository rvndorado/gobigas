import React, { Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './paymentVerify.scss';


const PaymentVerify = () => {
    const { type } = useParams();
    useEffect(() => {
        if(type === 'success')
        {
            Swal.fire({
                title: 'GCash Payment Success!',
                html: 'Please close the modal to proceed on processing the transaction',
                icon: 'success',
                showConfirmButton: false,
                showCancelButton: false,
                allowOutsideClick: false
            });
        } else {
            Swal.fire({
                title: 'GCash Payment Failed!',
                html: 'Please close the modal to proceed on retrying.',
                icon: 'error',
                showConfirmButton: false,
                showCancelButton: false,
                allowOutsideClick: false
            });            
        }

    }, []);

    return(<Fragment>
        <h1>Payment Verify</h1>
    </Fragment>)
}

export default PaymentVerify;