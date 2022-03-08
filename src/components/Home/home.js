import React, { Fragment } from 'react';
import Shop from '../Shop/shop';

import './home.scss';

const Home = () => {
    return(<Fragment>
        <div className="home">
            <div className="home__banner">
                <span className="h1 home__banner--header">Go Bigas</span>
                <span className="h2 home__banner--header">Quality grains right at your doorstep.</span>
            </div>

            <div className="home__shop">
                <Shop />
            </div>
        </div>
    </Fragment>);
}

export default Home;