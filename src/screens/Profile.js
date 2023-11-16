import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import { fetchUserProfile } from '../config/firebase';
import Sidebar from '../components/Sidebar';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            userEmail: '',
            userPhone: '',
            userAge: '',
            userGender: '',
            password: '',
            oldPassword: '',
            newPassword: '',
            error: '',
        };
    }

    componentDidMount() {
        this.unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
            const userData = await fetchUserProfile(authUser);
            const { userName, userEmail, userPhone, userAge, userGender, userPassword } = userData;
            this.setState({
                userName: userName,
                userEmail: userEmail,
                userPhone: userPhone,
                userAge: userAge,
                userGender: userGender,
                password: userPassword,
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    updateProfile = async () => {
        try {
            const user = firebase.auth().currentUser;

            if (user) {
                // Update additional user fields
                await firebase.firestore().collection('users').doc(user.uid).update({
                    userName: this.state.userName,
                    userEmail: this.state.userEmail,
                    userPhone: this.state.userPhone,
                    userAge: this.state.userAge,
                    userGender: this.state.userGender,
                });

                // Update password if provided
                if (this.state.newPassword) {
                    if (this.state.newPassword.length < 8) {

                    }
                    const credential = firebase.auth.EmailAuthProvider.credential(
                        this.state.userEmail,
                        this.state.oldPassword
                    );

                    user.reauthenticateWithCredential(credential)
                        .then(() => {
                            const newPassword = this.state.newPassword;
                            return user.updatePassword(newPassword);
                        })
                        .then(async () => {
                            await firebase.firestore().collection('users').doc(user.uid).update({
                                userPassword: this.state.newPassword,
                            });
                            this.setState({
                                oldPassword: '',
                                newPassword: '',
                            })
                            console.log('Password updated successfully!');
                        }).catch(e => {
                            this.setState({
                                error: 'Incorrect Password!',
                            })
                            return;
                        })

                }

                console.log('Profile updated successfully!');
            } else {
                console.error('No user is currently logged in.');
            }
        } catch (error) {
            console.error('Error updating profile: ', error);
        }
    };

    render() {
        const { userName, userEmail, userPhone, userAge, userGender, newPassword, oldPassword, error } = this.state;

        return (
            <Sidebar>
                <div>
                    <h2>Profile</h2>
                    <form>
                        <div className="form-group">
                            <label htmlFor="userName">Name:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="userName"
                                name="userName"
                                value={userName}
                                onChange={this.handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="userEmail">Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                id="userEmail"
                                name="userEmail"
                                value={userEmail}
                                onChange={this.handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="userPhone">Phone:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="userPhone"
                                name="userPhone"
                                value={userPhone}
                                onChange={this.handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="userAge">Age:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="userAge"
                                name="userAge"
                                value={userAge}
                                onChange={this.handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="userGender">Gender:</label>
                            <select
                                id="userGender"
                                name="userGender"
                                value={userGender}
                                onChange={this.handleInputChange}
                                className="form-control"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="oldPassword">Old Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                id="oldPassword"
                                name="oldPassword"
                                value={oldPassword}
                                onChange={this.handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={this.handleInputChange}
                            />
                        </div>

                        <div class={`alert ${error ? 'alert-danger' : 'd-none'}`} role="alert">
                            {error}
                        </div>
                        <button type="button" className="btn btn-primary" onClick={this.updateProfile}>
                            Update Profile
                        </button>
                    </form>
                </div>
            </Sidebar>
        );
    }
}

export default Profile;
