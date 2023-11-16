import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import Home from '../screens/Home';
import RegisterRestaurant from '../screens/RegisterRestaurant';
import Login from '../screens/Login';
import Restaurants from '../screens/Restaurants';
import RestaurantDetails from '../screens/RestaurantDetails';
import AddMenuItems from '../screens/AddMenuItems';
import OrderRequests from '../screens/OrderRequests';
import MyOrders from '../screens/MyOrders';
import MyFoods from '../screens/MyFoods';
import Address from '../screens/Address';
import BillComponent from '../screens/Bill';
import Profile from '../screens/Profile';
import Reviews from '../screens/Reviews';



const customHistory = createBrowserHistory();

// Routes For Navigation
const MyRoutes = () => (
    <Router history={customHistory}>
        <div>
            <Route exact path='/' component={Home}></Route>
            <Route path='/register-restaurant' component={RegisterRestaurant}></Route>
            <Route path='/login' component={Login}></Route>
            <Route path='/restaurants' component={Restaurants}></Route>
            <Route path='/restaurant-details' component={RestaurantDetails}></Route>
            <Route path='/add-menu-items' component={AddMenuItems}></Route>
            <Route path='/order-requests' component={OrderRequests}></Route>
            <Route path='/my-orders' component={MyOrders}></Route>
            <Route path='/my-foods' component={MyFoods}></Route>
            <Route path='/address' component={Address}></Route>
            <Route path='/bill' component={BillComponent}></Route>
            <Route path='/profile' component={Profile}></Route>
            <Route path='/reviews' component={Reviews}></Route>
        </div>
    </Router>
)

export default MyRoutes