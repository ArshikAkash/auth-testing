import './App.css';
import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from './firebase.config';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

function App() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const [newUser, setNewUser] = useState(false);
    const [user, setUser] = useState({
        isSignedIn: false,
        displayName: '',
        email: '',
        password: '',
        photo: '',
    });

    const handleSignIn = () => {
        firebase
            .auth()
            .signInWithPopup(provider)
            .then((res) => {
                const { displayName, photoURL, email } = res.user;
                const signedInUser = {
                    isSignedIn: true,
                    name: displayName,
                    email: email,
                    photo: photoURL,
                };
                setUser(signedInUser);
                console.log(displayName, photoURL, email);
            })
            .catch((err) => {
                console.log(err);
                console.log(err.message);
            });
    };

    const handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then((res) => {
                const signedOutUser = {
                    isSignedIn: false,
                    name: '',
                    email: '',
                    photo: '',
                    success: false,
                };
                setUser(signedOutUser);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleBlur = (e) => {
        let isFieldValid = true;

        if (e.target.name === 'email') {
            isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
        }
        if (e.target.name === 'password') {
            const isPasswordValid = e.target.value.length > 6;
            const passwordHasNumber = /\d{1}/.test(e.target.value);
            isFieldValid = isPasswordValid && passwordHasNumber;
        }
        if (isFieldValid) {
            const newUserInfo = { ...user };
            newUserInfo[e.target.name] = e.target.value;
            setUser(newUserInfo);
        }
    };

    const handleSubmit = (e) => {
        if (newUser && user.email && user.password && user.name) {
            firebase
                .auth()
                .createUserWithEmailAndPassword(user.email, user.password)
                .then((userCredential) => {
                    // Signed in

                    var user = userCredential.user;
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    updateUserName(user.displayName);

                    console.log(user);
                    // ...
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    const newUserInfo = { ...user };
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                    // ..
                });
        }
        if (!newUser && user.email && user.password) {
            firebase
                .auth()
                .signInWithEmailAndPassword(user.email, user.password)
                .then((userCredential) => {
                    // Signed in
                    var user = userCredential.user;
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    console.log('sign in user info', user);

                    // ...
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    const newUserInfo = { ...user };
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });
        }

        e.preventDefault();
    };

    const updateUserName = (name) => {
        const user = firebase.auth().currentUser;

        user.updateProfile({
            displayName: name,
        })
            .then(function () {
                console.log('updated successfully');
                // Update successful.
            })
            .catch(function (error) {
                // An error happened.
                console.log(error);
            });
    };

    return (
        <div className='App'>
            {user.isSignedIn ? (
                <button onClick={handleSignOut}>Sign out</button>
            ) : (
                <button onClick={handleSignIn}>Sign in</button>
            )}
            {user.isSignedIn && (
                <div>
                    {' '}
                    <p>Welcome,</p> <h1> {user.name}</h1>
                    <h4>{user.email}</h4>
                    <img src={user.photo} alt='' />{' '}
                </div>
            )}
            <h1>Our own authentication</h1>
            <input
                type='checkbox'
                onChange={() => setNewUser(!newUser)}
                name='newUser'
                id=''
            />
            <label htmlFor='newUser'>new user sign up </label>
            <form onSubmit={handleSubmit}>
                {newUser && (
                    <input
                        onBlur={handleBlur}
                        name='name'
                        required
                        placeholder='your name'
                        type='text'
                    />
                )}
                <br />
                <input
                    onBlur={handleBlur}
                    type='text'
                    name='email'
                    id=''
                    placeholder='Username or email'
                    required
                />{' '}
                <br />
                <input
                    onBlur={handleBlur}
                    type='password'
                    name='password'
                    placeholder='Password'
                    required
                />
                <br />
                <input type='submit' value='Submit' />
            </form>
            <p style={{ color: 'red' }}>{user.error}</p>
            {user.success && (
                <p style={{ color: 'green' }}>
                    User {newUser ? 'created' : 'logged in'} successfully
                </p>
            )}
        </div>
    );
}

export default App;
