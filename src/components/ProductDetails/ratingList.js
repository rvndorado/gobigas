import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Rating from '@material-ui/lab/Rating';
import Pagination from '@material-ui/lab/Pagination';
import { ProgressBar } from 'react-bootstrap';
import './ratingList.scss';


const RatingList = () => {
    const { product } = useSelector(state => state.product);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLength, setPageLength] = useState(1);
    const [ratingSummary, setRatingSummary] = useState([0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        if(product.feedback_list !== undefined && product.feedback_list.length > 0) {
            const totalPages = Math.ceil(product.feedback_list.length / 4);
            setPageLength(totalPages);

            const summary = [0, 0, 0, 0, 0, 0];

            product.feedback_list.map(item => {
                summary[item.star] += 1;
            });
            setRatingSummary(summary);
        }
    }, [])

    return(<Fragment>
        <div className="ratinglist">
            <span className="ratinglist__header">Product Reviews</span>
            <div className="ratinglist__summary">
                {ratingSummary.map((item, index) => {
                    if(index === 0) return;
                    return(<Fragment key={'ratingSummary' + index}>
                        <div className="ratinglist__summary--details">
                            <Rating
                                name="simple-controlled"
                                value={index}
                                readOnly
                            />
                            <ProgressBar 
                                now={(item / ratingSummary.length) * 100} 
                                label={item} 
                                variant="warning"
                                style={{ width: '40%' }}
                            />    
                        </div>
                    </Fragment>)
                })}

            </div>
       
            <hr />
            {product.feedback_list !== undefined && product.feedback_list.length > 0 &&
            <Fragment>
            {product.feedback_list.slice(0).reverse().slice((currentPage - 1) * 4 , 4 * currentPage).map((item, index) => {
                return(<Fragment key={'feedback' + index}>
                    <div className="ratinglist__details">
                        <Rating
                            name="simple-controlled"
                            value={item.star}
                            readOnly
                        />
                        <br />
                        <small>by: Verified Buyer</small>
                        <br />
                        <span> - {item.feedback}</span>
                        <hr />             
                    </div>
                </Fragment>);
            })}</Fragment>}
            {product.feedback_list === undefined && <span className="ratinglist__secondaryheader">No reviews yet</span>}

            {product.feedback_list !== undefined && product.feedback_list.length > 0 &&
            <div className="ratinglist__pagination">
                <Pagination 
                    count={pageLength} 
                    page={currentPage} 
                    variant="outlined" 
                    shape="rounded" 
                    onChange={(event, page) => setCurrentPage(page)}
                />
            </div>}
        </div>
    </Fragment>);
}

export default RatingList;