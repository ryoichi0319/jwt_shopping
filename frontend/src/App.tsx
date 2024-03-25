import React, { Profiler } from 'react';
import './App.css';
import { Routes, Route,BrowserRouter,useParams,useNavigate } from 'react-router-dom';

import { CookiesProvider, useCookies } from "react-cookie";
import SignUp from './Auth/SignUp';
import { useState,useEffect } from 'react';
import  axios from 'axios';
import MyPage from './MyPage';
import Profile from "./Profile"
import Login from './Auth/Login';
import Cart from "./Cart"
import Home from './Home';
import Navigation from './Navigation';
  

function App() {  

 
  return (
    <div className="App">
      <CookiesProvider>
      <BrowserRouter>
        <Navigation />

     

        <Routes>
            
            <Route path='/' element={<Home/>}/>
            <Route path="/login" element={<Login />} />

            <Route path="/signup" element={<SignUp />} />



            <Route path="/mypage" element={<MyPage />} />
            <Route path="/:id" element={<Profile />} />
            <Route path="/:id/cart" element={<Cart />} />



          </Routes>
          </BrowserRouter>

      </CookiesProvider>

    </div>
  );
}

export default App;
