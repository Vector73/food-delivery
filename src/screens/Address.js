import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import firebase, { addAddress, getAddresses } from '../config/firebase';

class Address extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addresses: [],
            newAddressLabel: '',
            newAddressText: '',
            showModal: false
        };
    }

    async componentDidMount() {
        try {
            this.unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
                const addresses = await getAddresses(authUser);
                this.setState({ addresses });
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

    handleAddAddress = async () => {
        const { addresses, newAddressLabel, newAddressText } = this.state;
        const newAddress = { label: newAddressLabel, address: newAddressText };
        await addAddress(newAddress);
        const updatedAddresses = await getAddresses();
        this.setState({
            addresses: updatedAddresses,
            newAddressLabel: '',
            newAddressText: '',
            showModal: false
        });
    }

    render() {
        const { addresses, newAddressLabel, newAddressText, showModal } = this.state;
        return (
            <div className="container py-4">
                <h2 className="mb-4">Delivery Addresses</h2>
                <div className="address-container">
                    {addresses.map((address, index) => (
                        <div className="address card mb-3" key={index}>
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Address Label: {address.label}</strong>
                                </h5>
                                <p className="card-text">{address.address}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="btn btn-primary mt-4"
                    onClick={() => this.setState({ showModal: true })}
                >
                    Add New Address
                </button>

                {showModal && (
                    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
                        <div className="modal-dialog" role="document" style={{ position: 'relative', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', width: '50%', margin: 'auto', zIndex: 1060 }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Address</h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => this.setState({ showModal: false })}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="addressLabel">Address Label</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="addressLabel"
                                                placeholder="Enter address label"
                                                value={newAddressLabel}
                                                onChange={(e) =>
                                                    this.setState({ newAddressLabel: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="addressText">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="addressText"
                                                placeholder="Enter address"
                                                value={newAddressText}
                                                onChange={(e) =>
                                                    this.setState({ newAddressText: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-primary mr-2"
                                                onClick={this.handleAddAddress}
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => this.setState({ showModal: false })}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Address;
