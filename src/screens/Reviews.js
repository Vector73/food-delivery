import firebase from 'firebase';
import React, { Component } from 'react';
import { fetchReviews } from '../config/firebase';
import Rating from 'react-rating-stars-component';
import Navbar from '../components/Navbar';
import Navbar2 from '../components/Navbar2';

class Reviews extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reviews: [],
        };
    }

    async componentDidMount() {
        try {
            this.unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
                console.log(authUser)
                const reviewsData = await fetchReviews(authUser.uid);
                console.log(reviewsData);
                this.setState({ reviews: reviewsData });
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


    render() {
        const { reviews } = this.state;

        return (
            <div className="container-fluid bill home-cont1">
                <Navbar2 history={this.props.history} />
                <div className="card mt-4 mx-auto w-50 bg-dark text-light">
                    <div className="card-body">
                        <h2 className="mb-4">Reviews</h2>
                        <ul className="list-unstyled">
                            {reviews.map((review) => (
                                <li key={review.id} className="border mb-3 p-3 rounded bg-secondary">
                                    <div className="d-flex flex-row-reverse justify-content-between align-items-center">
                                        <div className="d-flex justify-content-between align-items-center bg-info rounded-pill p-2">
                                            <div className="font-weight-bold text-white">Rating:</div>
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
                                    <p className="text-dark"><i>Posted by {review.author} on: {review.date}</i></p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        );
    }
}

export default Reviews;
