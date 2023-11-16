import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import firebase, { getAddresses, getCartItems, orderNow } from '../config/firebase';
import Swal from 'sweetalert2';
import { connect } from 'react-redux';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar2 from '../components/Navbar2';
import "../App.css"
import Footer from '../components/Footer';

class BillComponent extends Component {
    constructor(props) {
        super();
        this.state = {
            addresses: [],
            cartItems: [],
            totalPrice: 0,
            selectedAddress: {},
            isPlacingOrder: false,
            typeAddress: false,
            address: "",
            error: "",
        };
    }

    async componentDidMount() {
        try {
            this.unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
                const { state } = await this.props.location;
                const items = await getCartItems(authUser, state.userUid);
                let totalPrice = 0;
                items.forEach(item => {
                    totalPrice += parseFloat(item.itemPrice * item.quantity);
                });
                let addresses = await getAddresses(authUser);
                let i = 0;
                addresses = addresses.map((address) => {
                    return { ...address, id: i++ };
                })
                this.setState({
                    cartItems: items,
                    totalPrice,
                    resDetails: state,
                    addresses: addresses,
                    selectedAddress: addresses.length > 0 ? addresses[0] : {}
                });
            });

        } catch (error) {
            console.error('Error fetching cart items: ', error);
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handlePlaceOrder = (state) => {
        this.setState({
            isPlacingOrder: true
        })
        this.onPlaceOrder(state);
    };

    static getDerivedStateFromProps(props) {
        const { state } = props.location;
        const { user } = props
        return {
            resDetails: state,
            userDetails: user,
        }
    }

    async onPlaceOrder(state) {
        this.setState({
            isPlacingOrder: true
        })
        const { cartItems, totalPrice, resDetails, userDetails, selectedAddress, typeAddress, address } = state;
        let orderAddress = selectedAddress;
        if (typeAddress) {
            orderAddress = address;
        }
        else {
            orderAddress = selectedAddress.address;
        }
        if (!orderAddress) {
            this.setState({
                error: "Enter an address",
            })
            this.setState({
                isPlacingOrder: false,
            })
            return;
        }
        const orderNowReturn = await orderNow(cartItems, totalPrice, resDetails, userDetails, orderAddress);
        this.setState({
            isPlacingOrder: false,
        })
        this.audio.play();
        console.log(orderNowReturn)
        console.log("Successfully Ordered")
        Swal.fire({
            title: 'Success',
            text: 'Successfully Ordered',
            type: 'success',
        }).then(() => {
            this.props.history.push("/my-orders");
        }).finally(() => {
            this.setState({
                isPlacingOrder: false,
            })
        })
    }

    onAddressChange(id) {
        if (id === "addNewAddress") {
            this.setState({
                typeAddress: true,
            })
            return;
        }
        this.setState({
            selectedAddress: this.state.addresses[id]
        })
    }

    render() {
        const { cartItems, totalPrice, selectedAddress, addresses, resDetails, typeAddress, address } = this.state;

        return (
            <div className="container-fluid bill home-cont1">
                        <Navbar2 history={this.props.history} />
                        <div className="container mt-4">
                            <div className="card bg-light">
                                <div className="card-header bg-primary text-white">
                                    <h2 className="card-title">Bill</h2>
                                </div>
                                <div className="card-body">
                                    {typeAddress ? (
                                        <div className="mb-3">
                                            <label htmlFor="address" className="form-label">Address: </label>
                                            <div className="input-group mb-3 pl-2">
                                                <input
                                                    id="address"
                                                    className="form-control mr-2"
                                                    value={address}
                                                    onChange={(e) => this.setState({ address: e.target.value })}
                                                    placeholder="Enter address"
                                                />
                                                <button className="btn btn-outline-success" type="button" onClick={() => this.setState({ typeAddress: false })}>
                                                    <FontAwesomeIcon icon={faList} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-3">
                                            <label htmlFor="addressSelect" className="form-label">Select Address:</label>
                                            <select
                                                id="addressSelect"
                                                className="form-control"
                                                value={selectedAddress.label}
                                                onChange={(e) => this.onAddressChange(e.target.value)}
                                            >
                                                <option value="" disabled>Select an address</option>
                                                {addresses.map((address) => (
                                                    <optgroup label={address.label} key={address.id}>
                                                        <option value={address.id}>{address.address}</option>
                                                    </optgroup>
                                                ))}
                                                <option value="addNewAddress">Add new address</option>
                                            </select>
                                        </div>
                                    )}
                                    {this.state.error && (
                                        <div className="alert alert-danger" role="alert">
                                            {this.state.error}
                                        </div>
                                    )}
                                    <h4>{resDetails.userName}</h4>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr className="table-primary">
                                                <th>Item</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th><strong>Total</strong></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <img src={item.itemImageUrl} alt={item.itemTitle} style={{ maxWidth: '50px', maxHeight: '50px', marginRight: '30px' }} />
                                                        {item.itemTitle}
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.itemPrice}</td>
                                                    <td>₹{item.quantity * item.itemPrice}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" className="text-end fw-bold table-primary"><strong>Total:</strong></td>
                                                <td className="table-primary">₹{totalPrice}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div className="card-footer text-end">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => { this.onPlaceOrder(this.state) }}
                                        disabled={this.state.isPlacingOrder}
                                    >
                                        {this.state.isPlacingOrder ? (
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        ) : null}
                                        {this.state.isPlacingOrder ? '' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                            <audio ref={(audio) => (this.audio = audio)} src={require("../assets/sound/zing.mp3")} />
                        </div >
                    </div>
        );

    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps, null)(BillComponent);
