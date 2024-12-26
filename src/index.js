import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
} from 'react-router-dom'

import SignIn from './views/signInView/signIn.js';
import SignUp from './views/signUpView/signUp.js';
import Protected from './components/Protected.jsx';
import HomeView from './views/homeView/homeView.js';

const router = createBrowserRouter(
    createRoutesFromElements(
        // <Route path="*" element={<h1>404: page not found</h1>}/>
       <Route path='/' element={<App />}>
            <Route path='login' element={<SignIn />} />
            <Route path='register' element={<SignUp />} />
            <Route path='/' element={<Protected />} >
                <Route path='/' inedx element={<HomeView />} />
            </Route>
        </Route>
    )
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={router} />
);


