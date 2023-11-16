import React, { Component } from 'react';
// import Navbar from '../components/Navbar';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';
import firebase, { addReview, addToCart, decreaseItem, fetchReviews, getCartItems, removeFromCart } from '../config/firebase';
import { connect } from 'react-redux';
import { orderNow } from '../config/firebase';
import Swal from 'sweetalert2';
import Rating from 'react-rating-stars-component';

import 'bootstrap/dist/css/bootstrap.css';
import '../App.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EmptyContainer from '../components/Empty';

class RestaurantDetails extends Component {
    constructor() {
        super()
        this.state = {
            tab1: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
            tab2: "col-12 col-lg-4 col-md-4 text-center",
            tab3: "col-12 col-lg-4 col-md-4 text-center",
            tab1Content: true,
            tab2Content: false,
            tab3Content: false,
            cartItemsList: JSON.parse(localStorage.getItem('cartItems')) || [],
            totalPrice: parseInt(localStorage.getItem('cartPrice')) || 0,
            showCartList: true,
            reviews: [],
            newReview: {
                rating: '',
                text: '',
                author: '',
            },
        }
    }

    async componentDidMount() {
        const { state } = await this.props.location
        this.fetchMenuItems()
        if (state) {
            const items = await getCartItems(null, state.userUid);
            const reviews = await fetchReviews(state.userUid);
            if (reviews) {
                this.setState({
                    reviews: reviews,
                })
            }
            console.log(items);
            if (items.length > 0) {
                let sum = 0;
                for (let i = 0; i < items.length; i++) {
                    sum += parseInt(items[i].itemPrice * items[i].quantity);
                }
                this.setState({
                    totalPrice: sum
                })
                this.setState({
                    cartItemsList: items,
                    showCartList: true,
                    resDetails: state,
                })
                localStorage.setItem('cartItems', JSON.stringify(items));
                localStorage.setItem('cartPrice', sum.toString());
            }

        }
        else {
            this.props.history.push('/restaurants')
        }
    }
    componentWillUnmount() {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartPrice');
    }

    static getDerivedStateFromProps(props) {
        const { state } = props.location;
        const { user } = props
        return {
            resDetails: state,
            userDetails: user,
        }
    }

    handleTabs(e) {
        if (e === "tab1") {
            this.setState({
                tab1: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
                tab2: "col-12 col-lg-4 col-md-4 text-center",
                tab3: "col-12 col-lg-4 col-md-4 text-center",
                tab1Content: true,
                tab2Content: false,
                tab3Content: false,
            })
        } else if (e === "tab2") {
            this.setState({
                tab1: "col-12 col-lg-4 col-md-4 text-center",
                tab2: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
                tab3: "col-12 col-lg-4 col-md-4 text-center",
                tab1Content: false,
                tab2Content: true,
                tab3Content: false,
            })
        } else if (e === "tab3") {
            this.setState({
                tab1: "col-12 col-lg-4 col-md-4 text-center",
                tab2: "col-12 col-lg-4 col-md-4 text-center",
                tab3: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
                tab1Content: false,
                tab2Content: false,
                tab3Content: true,
            })
        }
    }

    fetchMenuItems() {
        const { resDetails } = this.state;
        firebase.firestore().collection('users').doc(resDetails.id).collection("menuItems").onSnapshot(snapshot => {
            const menuItemsList = [];
            snapshot.forEach(doc => {
                const obj = { id: doc.id, ...doc.data() }
                menuItemsList.push(obj)
            })
            this.setState({
                menuItemsList: menuItemsList,
            })
        })
    }

    async addToCart(item) {
        const { cartItemsList, totalPrice, resDetails } = this.state
        console.log(resDetails);
        item = { ...item, restaurant: resDetails.userUid }
        let exists = false;
        if (item) {
            await addToCart(item);
            cartItemsList.map((i) => {
                if (item.id === i.id) {
                    i.quantity += 1;
                    exists = true;
                    return item;
                }
                return i;
            });
        }
        if (!exists) cartItemsList.push({ ...item, quantity: 1 });
        this.setState({
            totalPrice: totalPrice + Number(item.itemPrice),
            cartItemsList: cartItemsList,
            showCartList: true,
        })
        localStorage.setItem('cartItems', JSON.stringify(this.state.cartItemsList));
        localStorage.setItem('cartPrice', this.state.totalPrice.toString());
        console.log(this.state.cartItemsList)
    }

    async removeCartItem(itemIndex, item) {
        const { cartItemsList, totalPrice } = this.state
        const removedItemPrice = Number(cartItemsList[itemIndex].itemPrice)
        console.log(itemIndex);
        await removeFromCart(item)
        cartItemsList.splice(itemIndex, 1);

        this.setState({
            totalPrice: totalPrice - removedItemPrice * item.quantity,
            cartItemsList: cartItemsList,
        })
        localStorage.setItem('cartItems', JSON.stringify(this.state.cartItemsList));
        localStorage.setItem('cartPrice', this.state.totalPrice.toString());
    }

    async decreaseItem(itemIndex, item) {
        const { cartItemsList, totalPrice } = this.state
        const removedItemPrice = Number(cartItemsList[itemIndex].itemPrice);
        console.log(itemIndex);
        await decreaseItem(item)
        cartItemsList.map((i) => {
            if (item.id === i.id) {
                if (item.quantity > 1) {
                    i.quantity -= 1;
                    return i;
                } else {
                    return null;
                }
            }
            return i;
        }).filter(e => e !== null);

        // if (!exists) cartItemsList.splice(itemIndex, 1);
        this.setState({
            totalPrice: totalPrice - removedItemPrice,
            cartItemsList: cartItemsList,
        })
        localStorage.setItem('cartItems', JSON.stringify(this.state.cartItemsList));
        localStorage.setItem('cartPrice', this.state.totalPrice.toString());
    }

    async handleConfirmOrderBtn() {
        const { cartItemsList, totalPrice, resDetails, userDetails } = this.state;
        console.log(cartItemsList.length)
        if (userDetails) {
            if (!userDetails.isRestaurant) {
                if (cartItemsList.length > 0) {
                    try {
                        const history = this.props.history;
                        history.push("/bill", resDetails);
                        // const orderNowReturn = await orderNow(cartItemsList, totalPrice, resDetails, userDetails, history)
                        // console.log(orderNowReturn)
                        // console.log("Successfully Ordered")
                        // Swal.fire({
                        //     title: 'Success',
                        //     text: 'Successfully Ordered',
                        //     type: 'success',
                        // }).then(() => {
                        //     history.push("/my-orders");
                        // })
                    } catch (error) {
                        // console.log(" Error in confirm order => ", error)
                        Swal.fire({
                            title: 'Error',
                            text: error,
                            type: 'error',
                        })
                    }
                } else {
                    console.log("You have to select atleast one item")
                    Swal.fire({
                        title: 'Error',
                        text: 'You have to select atleast one item',
                        type: 'error',
                    })
                }
            } else {
                // console.log("You are not able to order")
                Swal.fire({
                    title: 'Error',
                    text: 'You are not able to order',
                    type: 'error',
                })
            }
        } else {
            // console.log("You must be Loged In")
            Swal.fire({
                title: 'Error',
                text: 'You must be Loged In',
                type: 'error',
            }).then(() => {
                this.props.history.push('/login')
            })
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            newReview: { ...prevState.newReview, [name]: value },
        }));
    };

    handleAddReview = async (e) => {
        e.preventDefault();

        try {
            await addReview(
                this.state.resDetails.userUid,
                this.state.newReview.rating,
                this.state.newReview.text,
                this.state.userDetails.userName,
            );

            this.setState({
                newReview: {
                    rating: '',
                    text: '',
                },
            });

            const reviews = await fetchReviews(this.state.resDetails.userUid);
            this.setState({
                reviews: reviews,
            })
        } catch (error) {
            console.error('Error adding review: ', error);
        }
    };

    _renderMenuItemsList() {
        const { menuItemsList } = this.state;
        if (menuItemsList) {
            return Object.keys(menuItemsList).map((val) => {
                return (
                    <div className="container border-bottom pb-2 px-lg-0 px-md-0 mb-4" key={menuItemsList[val].id}>
                        <div className="row">
                            <div className="col-lg-2 col-md-3 col-8 offset-2 offset-lg-0 offset-md-0 px-0 mb-3 text-center">
                                <img style={{ width: "70px", height: "70px" }} alt="Natural Healthy Food" src={menuItemsList[val].itemImageUrl} />
                            </div>
                            <div className="col-lg-7 col-md-6 col-sm-12 px-0">
                                <h6 className="">{menuItemsList[val].itemTitle}</h6>
                                <p className=""><small>{menuItemsList[val].itemIngredients}</small></p>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12 px-0 text-center">
                                <span className="mx-3">RS.{menuItemsList[val].itemPrice}</span>
                                <span className="menuItemsListAddBtn" onClick={() => this.addToCart(menuItemsList[val])} ><FontAwesomeIcon icon="plus" className="text-warning" /></span>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        else {
            return <EmptyContainer />;
        }
    }

    _renderCartItemsList() {
        const { cartItemsList } = this.state
        if (cartItemsList) {
            return Object.keys(cartItemsList).map((val) => {
                return (
                    <li className="food-item border-bottom pb-2 mb-3" key={val}>
                        <div className="row">
                            <div className="col-4 pr-0 d-flex align-items-center">
                                <strong><span className="mb-0">{cartItemsList[val].itemTitle}</span></strong>
                            </div>
                            <div className="col-4 pl-0 d-flex align-items-center">
                                <p className="mb-0"><span className="food-price text-right">RS.{cartItemsList[val].itemPrice}</span>
                                    <span onClick={() => this.removeCartItem(val, cartItemsList[val])} className="remove-food-item"><FontAwesomeIcon icon="times" /></span></p>
                            </div>
                            <div className="col-">
                                <span className='counter'>
                                    <span className="count change rounded-sm" onClick={() => this.addToCart(cartItemsList[val])}>+</span>
                                    <span className="count rounded-sm">{cartItemsList[val].quantity}</span>
                                    <span className="count change rounded-sm" onClick={() => this.decreaseItem(val, cartItemsList[val])}>-</span>
                                </span>
                            </div>
                        </div>
                    </li>
                )
            })
        }
    }

    render() {
        const { tab1, tab2, tab3, tab1Content, tab2Content, tab3Content, resDetails, totalPrice, cartItemsList, showCartList, reviews } = this.state;
        return (
            <div>
                <div className="container-fluid res-details-cont1">
                    <div className="">
                        {/* <Navbar history={this.props.history} /> */}
                        <Navbar2 history={this.props.history} />
                        <div className="container px-0 res-details-cont1-text mx-0">
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-2 col-md-3 col-6 text-lg-center text-md-center pr-0 mb-2">
                                        <img className="p-2 bg-white rounded text-center" alt="Natural Healthy Food" style={{ width: "60%" }} src={resDetails.userProfileImageUrl} />
                                    </div>
                                    <div className="col-lg-10 col-md-9 col-12 pl-lg-0 pl-md-0">
                                        <h1 className="restaurant-title">{resDetails.userName}</h1>
                                        <p className="restaurant-text">{resDetails.typeOfFood.join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ background: "#EBEDF3" }} className="container-fluid py-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-2 col-md-2 col-sm-12">
                                <div className="listing-category">
                                    <div className="category-heading py-0 mb-1">
                                        <h6 className="m-0"><FontAwesomeIcon icon="utensils" className="mr-2" />Categories</h6>
                                    </div>
                                    <div>
                                        <ul className="category-list">
                                            <li>
                                                <p>Kebabs</p>
                                            </li>
                                            <li>
                                                <p>Chicken</p>
                                            </li>
                                            <li>
                                                <p>Burgers</p>
                                            </li>
                                            <li>
                                                <p>Biryani</p>
                                            </li>
                                            <li>
                                                <p>Sauces</p>
                                            </li>
                                            <li>
                                                <p>Vegatable Dishes</p>
                                            </li>
                                            <li>
                                                <p>Garlic Bread</p>
                                            </li>
                                            <li>
                                                <p>Specials</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-7 col-sm-12">
                                <div className="container">
                                    <div className="row">
                                        <div className={tab1} onClick={() => this.handleTabs("tab1")}>
                                            <p className="res-details-tab-text"><FontAwesomeIcon icon="concierge-bell" className="mr-3" />Menu</p>
                                        </div>
                                        <div className={tab2} onClick={() => this.handleTabs("tab2")}>
                                            <p className="res-details-tab-text"><FontAwesomeIcon icon="comment-alt" className="mr-3" />Reviews</p>
                                        </div>
                                        <div className={tab3} onClick={() => this.handleTabs("tab3")}>
                                            <p className="res-details-tab-text"><FontAwesomeIcon icon="info-circle" className="mr-3" />Restaurant Info</p>
                                        </div>
                                    </div>
                                    {tab1Content &&
                                        <div className="row menu-section review-section">
                                            <div className="col-12 bg-white p-4">
                                                <div className="input-group input-group-sm mb-4 mt-2">
                                                    <input type="text" className="form-control search-menu-input" htmlFor="search-menu" placeholder="Search food item" />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text search-menu-text" id="search-menu"><FontAwesomeIcon icon="search" /></span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-4 text-warning">Best food items:</h6>
                                                    {this._renderMenuItemsList()}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {tab2Content && <div className="row review-section">
                                        <div className="col-12 bg-light p-4 rounded">
                                            <div className="row p-5">
                                                <div className="col-6 text-right">
                                                    <img alt="Review Icon" src={require("../assets/images/icon-review.png")} />
                                                </div>
                                                <div className="col-6 pl-0 pb-2 d-flex align-items-center">
                                                    <p className="mb-0"><strong className="text-success text-center">Write your own reviews</strong></p>
                                                </div>
                                            </div>
                                            <form onSubmit={this.handleAddReview} className="mb-4">
                                                <div className="mb-3">
                                                    <label htmlFor="rating" className="form-label">Rating:</label>
                                                    <Rating
                                                        count={5}
                                                        onChange={(rating) => this.setState(prevState => ({ newReview: { ...prevState.newReview, rating } }))}
                                                        size={30}
                                                        activeColor="#ffd700"
                                                        isHalf={false}
                                                        value={this.state.newReview.rating}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="text" className="form-label">Your Review:</label>
                                                    <textarea
                                                        name="text"
                                                        id="text"
                                                        className="form-control"
                                                        value={this.state.newReview.text}
                                                        onChange={this.handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary">Add Review</button>
                                            </form>
                                            <h5 className="mb-3">Customer Reviews For {resDetails.userName}</h5>
                                            <ul className="list-unstyled">
                                                {this.state.reviews.map(review => (
                                                    <li key={review.id} className="border mb-3 p-3 rounded">
                                                        <div className="d-flex flex-row-reverse justify-content-between align-items-center">
                                                            <div className="d-flex justify-content-between align-items-center bg-info rounded-pill justify-self-right pt-1 pb-1 pr-3 pl-3">
                                                                <div className="font-weight-bold text-white">Rating: </div>
                                                                <Rating
                                                                    value={review.rating}
                                                                    edit={false}
                                                                    size={20}
                                                                    activeColor="#ffd700"
                                                                    isHalf={false}
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="mt-2">{review.text}</p>
                                                        <p className="text-muted"><i>Posted by {review.author} on: {review.date}</i></p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                    </div>
                                    }
                                    {tab3Content && <div className="row info-section">
                                        <div className="col-12 bg-white p-4">
                                            <h5>Overview {resDetails.userName}</h5>
                                            <p>{resDetails.info || "No Info"}</p>
                                        </div>
                                    </div>
                                    }
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12">
                                <div className="container bg-white py-3 order-card">
                                    <h6 className="border-bottom pb-2 mb-3"><FontAwesomeIcon icon="shopping-basket" className="mr-2" />Your Order</h6>
                                    {cartItemsList.length > 0 ? <div>
                                        <div>
                                            <ul>
                                                {this._renderCartItemsList()}
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="row ">
                                                <div className="col-12">
                                                    <p style={{ backgroundColor: '#f1f3f8', padding: '10px 15px' }}>Total: <span style={{ float: 'right', color: '#2f313a', fontSize: '14px', fontWeight: 700 }}><em>RS.{totalPrice}</em></span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : <p className="text-success">There are no items in your basket.</p>}
                                    <div>
                                        <div className="row ">
                                            <div className="col-12">
                                                <button onClick={() => this.handleConfirmOrderBtn()} type="button" className="btn btn-warning btn-sm btn-block text-uppercase mr-2 mr-1 px-3"><b>Confirm Order</b></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div >
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps, null)(RestaurantDetails);