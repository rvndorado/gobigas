import React, { Fragment, useState } from 'react';
import { useHistory } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import { Button } from 'react-bootstrap';
import './trackOrder.scss';


const TrackOrder = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const history = useHistory();
    const handleSubmit = (e) => {
        e.preventDefault();
        history.push('/order/' + orderNumber);
    }
    return(<Fragment>
        <div className="trackOrder container">
            <span className="trackOrder__header">TRACK YOUR ORDER</span>
            <form className="trackOrder__form" onSubmit={handleSubmit}>
                <TextField 
                    label="Order Number" 
                    variant="outlined" 
                    fullWidth
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    style={{ marginBottom: '12px' }}
                />
                <Button 
                    variant="outlined" 
                    className="trackOrder__form--button"
                    type="submit"
                    block={true}
                >
                    TRACK
                </Button>
            </form>
        </div>
        
    </Fragment>);
}

export default TrackOrder;