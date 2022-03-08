import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Drawer from '@material-ui/core/Drawer';
import Cart from '../../components/Cart/cart';
import Badge from '@material-ui/core/Badge';

import { SET_DRAWER_STATUS, FETCH_CART_LIST } from '../../reducers/features/cart';

import './navBar.scss';
import logo from '../../images/gobigaslogo.png';

const NavBar = () => {
    const { currentUser, logout } = useAuth();
    const history = useHistory();
    const { pathname } = useLocation();
    
    const dispatch = useDispatch();
    const { isDrawerOpen, cartList } = useSelector(state => state.cart);  

    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
      };
    
      const handleClose = () => {
        setAnchorEl(null);
      };

    const handleLogout = async () => {
        try {
            handleClose();
            await logout();
            history.push('/');
        } catch(error) {
            console.log(error);
        }
    }
    
    const handleScroll = () => {
        const element = document.getElementById('navigation');
        const currentLocation = window.location.pathname;
        if (window.scrollY < 350 && currentLocation === '/') {
            element.classList.add('navigation-transparent');
        } else {
            element.classList.remove('navigation-transparent');
        }
    }

    const handleNavbarStyle = () => {
        const element = document.getElementById('navigation');
        if (pathname === '/') {
            element.classList.add('navigation-transparent');
            window.addEventListener('scroll', handleScroll);
        } else {
            element.classList.remove('navigation-transparent')
            window.removeEventListener('scroll', handleScroll);
        }
    }

    useEffect(() => {
        if(cartList.length === 0) {
            const userID = currentUser !== null ? currentUser.uid : '0';
            dispatch(FETCH_CART_LIST(userID));
        }
        handleNavbarStyle();
    }, []);

    useEffect(() => {
        handleNavbarStyle();
    }, [pathname])


    
    return(<Fragment>
        <header className={(pathname === '/' || pathname === '/shop') ? ' navigation navigation-fixed' : 'navigation'} id="navigation">
            <div className="navigation__container container">
                <div className="navigation__container--logo">
                    <Link to="/" className="text-link">
                        <img src={logo} alt="gobigas-logo" alt="Gobigas Logo" />
                    </Link>
                </div>
                <div className="navigation__container--links">
                    <Link to="/shop" className="text-link"><span className="navigation__container--link">Shop</span></Link>
                    { (pathname.includes('product') || pathname.includes('/shop') || pathname === '/') &&
                    <span className="navigation__container--link">
                        <Tooltip title="View Cart">
                            <Badge badgeContent={cartList.length} color="secondary">
                                <ShoppingCartOutlinedIcon onClick={() => dispatch(SET_DRAWER_STATUS(true))} />
                            </Badge>
                        </Tooltip>
                        <Drawer anchor="right" open={isDrawerOpen} onClose={() => dispatch(SET_DRAWER_STATUS(false))}>
                            <Cart />
                        </Drawer>
                    </span>
                    }
                    <span className="navigation__container--link">
                        <Tooltip title="View Account Profile">
                            <AccountCircleRoundedIcon aria-controls="user-menu" onClick={handleOpen} />
                        </Tooltip>
                        <Menu
                            id="user-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            getContentAnchorEl={null}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            transformOrigin={{ vertical: "top", horizontal: "center" }}
                        >
                            {!currentUser && 
                            <Link to="/signUp" className="text-link">
                                <MenuItem onClick={handleClose}>
                                    Register
                                </MenuItem>
                            </Link>}

                            {!currentUser && 
                            <Link to="/signIn" className="text-link">
                                <MenuItem onClick={handleClose}>
                                    Login
                                </MenuItem>
                            </Link>}
                            {currentUser && 
                            <Link to="/orderHistory" className="text-link">
                                <MenuItem onClick={handleClose}>
                                    Order History
                                </MenuItem>
                            </Link>}
                            {currentUser && 
                            <Link to="/changePassword" className="text-link">
                                <MenuItem onClick={handleClose}>
                                    Change Password
                                </MenuItem>
                            </Link>}                             
                            {currentUser &&<MenuItem onClick={handleLogout}>Logout</MenuItem>}
                        </Menu>
                    </span>
                </div>
            </div>
            
        </header>
    </Fragment>);
}

export default NavBar;