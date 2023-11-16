import * as firebase from 'firebase';
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAaQPYsQSp5xlXvzPRSznujG_PzwJjVS9M",
    authDomain: "food-delivery-6e56d.firebaseapp.com",
    projectId: "food-delivery-6e56d",
    storageBucket: "food-delivery-6e56d.appspot.com",
    messagingSenderId: "1057812411939",
    appId: "1:1057812411939:web:a609cd2c0842593f2ca396",
    measurementId: "G-HCFZYMJXB2"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

function signUp(userDetails) {
    return new Promise((resolve, reject) => {
        const { userName, userEmail, userPassword, userGender, userPhone, userAge, userProfileImage, isRestaurant, typeOfFood, info } = userDetails;
        firebase.auth().createUserWithEmailAndPassword(userDetails.userEmail, userDetails.userPassword).then((success) => {
            let user = firebase.auth().currentUser;
            var uid;
            if (user != null) {
                uid = user.uid;
            };
            firebase.storage().ref().child(`userProfileImage/${uid}/` + userProfileImage.name).put(userProfileImage).then((url) => {
                console.log("my" + url);
                url.ref.getDownloadURL().then((success) => {
                    const userProfileImageUrl = success
                    console.log(userProfileImageUrl)
                    const userDetailsForDb = {
                        userName: userName,
                        userEmail: userEmail,
                        userPassword: userPassword,
                        userGender: userGender,
                        userPhone: userPhone,
                        userAge: userAge,
                        userUid: uid,
                        isRestaurant: isRestaurant,
                        userProfileImageUrl: userProfileImageUrl,
                        typeOfFood: typeOfFood,
                        info: info,
                    }
                    db.collection("users").doc(uid).set(userDetailsForDb).then((docRef) => {
                        // console.log("Document written with ID: ", docRef.id);
                        if (userDetailsForDb.isRestaurant) {
                            userDetails.propsHistory.push("/order-requests");
                            resolve(userDetailsForDb)
                        } else {
                            userDetails.propsHistory.push("/");
                            resolve(userDetailsForDb)
                        }
                    }).catch(function (error) {
                        console.error("Error adding document: ", error);
                        reject(error)
                    })
                }).catch((error) => {
                    // Handle Errors here.
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    console.log("Error in getDownloadURL function", errorMessage);
                    reject(errorMessage)
                })
            }).catch((error) => {
                // Handle Errors here.
                let errorCode = error.code;
                let errorMessage = error.message;
                console.log("Error in Image Uploading", errorMessage);
                reject(errorMessage)
            })
        }).catch((error) => {
            var errorMessage = error.message;
            console.log("Error in Authentication", errorMessage);
            reject(errorMessage)
        })
    })
}

async function fetchUserProfile(user) {
    if (!user) user = firebase.auth().currentUser;
    if (user) {
        try {
            const userDocRef = firebase.firestore().collection('users').doc(user.uid);
            const userDocSnapshot = await userDocRef.get();
            let userData = {};
            if (userDocSnapshot.exists) {
                userData = userDocSnapshot.data();
            }
            return {
                userName: userData.userName || '',
                userEmail: userData.userEmail || '',
                userPhone: userData.userPhone || '',
                userAge: userData.userAge || '',
                userGender: userData.userGender || '',
                userPassword: userData.userPassword || '',
            }
        } catch (e) {
            console.log(e);
        };
    }
};

function logIn(userLoginDetails) {
    return new Promise((resolve, reject) => {
        const { userLoginEmail, userLoginPassword } = userLoginDetails;
        firebase.auth().signInWithEmailAndPassword(userLoginEmail, userLoginPassword).then((success) => {
            db.collection('users').doc(success.user.uid).get().then((snapshot) => {
                console.log("snapshot.data =>>", snapshot.data().isRestaurant);
                if (snapshot.data().isRestaurant) {
                    userLoginDetails.propsHistory.push("/order-requests");
                    resolve(success)
                } else {
                    userLoginDetails.propsHistory.push("/");
                    resolve(success)
                }
            })
        }).catch((error) => {
            // Handle Errors here.
            // var errorCode = error.code;
            var errorMessage = error.message;
            reject(errorMessage)
        });

    })
}

function addItem(itemDetails) {
    const { itemTitle, itemIngredients, itemPrice, itemImage, chooseItemType, } = itemDetails;
    return new Promise((resolve, reject) => {
        let user = firebase.auth().currentUser;
        var uid;
        if (user != null) {
            uid = user.uid;
        };
        firebase.storage().ref().child(`itemImage/${uid}/` + itemImage.name).put(itemImage).then((url) => {
            url.ref.getDownloadURL().then((success) => {
                const itemImageUrl = success
                console.log(itemImageUrl)
                const itemDetailsForDb = {
                    itemTitle: itemTitle,
                    itemIngredients: itemIngredients,
                    itemPrice: itemPrice,
                    itemImageUrl: itemImageUrl,
                    chooseItemType: chooseItemType,
                    // userUid: uid,
                }
                db.collection("users").doc(uid).collection("menuItems").add(itemDetailsForDb).then((docRef) => {
                    // console.log("Document written with ID: ", docRef.id);
                    // itemDetails.propsHistory.push("/my-foods");
                    resolve("Successfully added food item")
                }).catch(function (error) {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    reject(errorMessage)
                    // console.error("Error adding document: ", error);
                })
            }).catch((error) => {
                // Handle Errors here.
                let errorCode = error.code;
                let errorMessage = error.message;
                console.log("Error in getDownloadURL function", errorCode);
                console.log("Error in getDownloadURL function", errorMessage);
                reject(errorMessage)
            })
        }).catch((error) => {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log("Error in Image Uploading", errorMessage);
            reject(errorMessage)
        })
    })
}

const getAddresses = async (user) => {
    if (!user) user = firebase.auth().currentUser;
    var uid;
    if (user != null) {
        uid = user.uid;
    };
    const addresses = [];
    try {
        const querySnapshot = await db.collection("users").doc(uid).collection('addresses').get();
        querySnapshot.forEach((doc) => {
            addresses.push(doc.data());
        });
    } catch (error) {
        console.error('Error getting documents: ', error);
    }
    return addresses;
};

const addAddress = async (newAddress) => {
    let user = firebase.auth().currentUser;
    var uid;
    if (user != null) {
        uid = user.uid;
    };
    try {
        await db.collection("users").doc(uid).collection('addresses').add(newAddress);
    } catch (error) {
        console.error('Error adding document: ', error);
    }
};

const addToCart = async (item) => {
    try {
        const user = firebase.auth().currentUser;
        let uid;
        if (user != null) {
            uid = user.uid;
            const cartRef = db.collection('users').doc(uid).collection('cart');
            const querySnapshot = await cartRef.where('id', '==', item.id).get();
            if (querySnapshot.empty) {
                await cartRef.add({ ...item, quantity: 1 });
                console.log('Item added to cart successfully!');
            } else {
                querySnapshot.forEach(async (doc) => {
                    const existingQuantity = doc.data().quantity;
                    await cartRef.doc(doc.id).update({ ...item, quantity: existingQuantity + 1 });
                    console.log('Item quantity updated in cart!');
                });
            }
        } else {
            console.error('No user is currently logged in.');
        }
    } catch (error) {
        console.error('Error adding to cart: ', error);
    }
};

const decreaseItem = async (item) => {
    try {
        const user = firebase.auth().currentUser;
        let uid;
        if (user != null) {
            uid = user.uid;
            const cartRef = db.collection('users').doc(uid).collection('cart');
            const querySnapshot = await cartRef.where('id', '==', item.id).get();
            if (querySnapshot.empty) {
                console.log('Item not found in cart.');
            } else {
                querySnapshot.forEach(async (doc) => {
                    const existingQuantity = doc.data().quantity;
                    if (existingQuantity === 1) {
                        await cartRef.doc(doc.id).delete();
                        console.log('Item removed from cart successfully!');
                    } else {
                        await cartRef.doc(doc.id).update({ ...item, quantity: existingQuantity - 1 });
                        console.log('Item quantity updated in cart!');
                    }
                });
            }
        } else {
            console.error('No user is currently logged in.');
        }
    } catch (error) {
        console.error('Error removing from cart: ', error);
    }
};

const removeFromCart = async (item) => {
    try {
        const user = firebase.auth().currentUser;
        let uid;
        if (user != null) {
            uid = user.uid;
            const cartRef = db.collection('users').doc(uid).collection('cart');
            const querySnapshot = await cartRef.where('id', '==', item.id).get();
            if (querySnapshot.empty) {
                console.log('Item not found in cart.');
            } else {
                querySnapshot.forEach(async (doc) => {
                    await cartRef.doc(doc.id).delete();
                    console.log('Item removed from cart successfully!');
                });
            }
        } else {
            console.error('No user is currently logged in.');
        }
    } catch (error) {
        console.error('Error removing from cart: ', error);
    }
};

const clearCart = async () => {
    try {
        const user = firebase.auth().currentUser;
        let uid;
        if (user != null) {
            uid = user.uid;
            const cartRef = db.collection('users').doc(uid).collection('cart');
            const querySnapshot = await cartRef.get();
            querySnapshot.forEach(async (doc) => {
                await cartRef.doc(doc.id).delete();
            });
            console.log('Cart cleared successfully!');
        } else {
            console.error('No user is currently logged in.');
        }
    } catch (error) {
        console.error('Error clearing cart: ', error);
    }
};

const getCartItems = async (user, restaurant) => {
    try {
        if (!user) user = firebase.auth().currentUser;
        let uid;
        if (user != null) {
            uid = user.uid;
            const cartRef = db.collection('users').doc(uid).collection('cart');
            const querySnapshot = await cartRef.where('restaurant', '==', restaurant).get();
            const cartItems = [];
            querySnapshot.forEach((doc) => {
                cartItems.push(doc.data());
            });
            return cartItems;
        } else {
            console.error('No user is currently logged in.');
            return [];
        }
    } catch (error) {
        console.error('Error getting cart items: ', error);
        return [];
    }
};

function orderNow(cartItemsList, totalPrice, resDetails, userDetails, address) {
    return new Promise((resolve, reject) => {
        let user = firebase.auth().currentUser;
        var uid;
        if (user != null) {
            uid = user.uid;
        };

        const myOrder = {
            itemsList: cartItemsList,
            totalPrice: totalPrice,
            status: "PENDING",
            address: address,
            ...resDetails,
            order_timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }

        const orderRequest = {
            itemsList: cartItemsList,
            totalPrice: totalPrice,
            status: "PENDING",
            address: address,
            ...userDetails,
            order_timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }

        // console.log("myOrder => ", myOrder)
        // console.log("orderRequest => ", orderRequest)
        db.collection("users").doc(uid).collection("myOrder").add(myOrder).then((docRef) => {
            // console.log(docRef.id)
            db.collection("users").doc(resDetails.id).collection("orderRequest").doc(docRef.id).set(orderRequest).then((docRef) => {
                // console.log("Document written with ID: ", docRef.id);
                resolve('Successfully ordered')
                // history.push("/my-orders");
            }).catch(function (error) {
                console.error("Error adding document: ", error.message);
                reject(error.message)
            })
        }).catch(function (error) {
            console.error("Error adding document: ", error.message);
            reject(error.message)
        })
    })
}

const fetchReviews = async (restaurantId) => {
    try {
        const reviewsCollection = await firebase.firestore().collection('reviews').where('restaurantId', '==', restaurantId).orderBy('date', 'desc').get();
        const reviewsData = reviewsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return reviewsData;
    } catch (error) {
        console.error('Error fetching reviews: ', error);
    }
};

export const addReview = async (restaurantId, rating, text, author) => {
    try {
        await db.collection('reviews').add({
            restaurantId,
            rating,
            text,
            author,
            date: new Date().toLocaleDateString(),
        });
        console.log('Review added successfully!');
    } catch (error) {
        console.error('Error adding review: ', error);
    }
};

export default firebase;
export {
    signUp,
    logIn,
    addItem,
    orderNow,
    getAddresses,
    addAddress,
    addToCart,
    removeFromCart,
    clearCart,
    getCartItems,
    decreaseItem,
    fetchUserProfile,
    fetchReviews,
}