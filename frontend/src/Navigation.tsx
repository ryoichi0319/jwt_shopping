"use client"

import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './nav.css'
interface UserProfileProps {
    id: number;
    name: string;
    email: string;
   
}


// ナビゲーション
const Navigation = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['token']);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<UserProfileProps | null >(null);

    useEffect(() => {
        const fetchData = async () => {

            try {
                axios.defaults.withCredentials = true;

                if (cookies.token) {
                    setIsLoggedIn(true);
                    const response = await axios.get(`http://localhost:8000/auth/authenticate`, {
                        headers: {
                            Authorization: `Bearer ${cookies.token}`
                        }
                    });
                    setUserData(response.data);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, [cookies, ]);

    const handleLogout = async () => {
      try {
          await axios.post(`http://localhost:8000/auth/logout`);
          removeCookie('token');
          navigate('/');
      } catch (error) {
          console.error('Error logging out:', error);
      }
  };
    
    

   
  return (
    <header >
      <div  className='nav'>    
      {cookies.token ? (
        <div className='nav_button_wrapper'>                      
        <button className='shop_button'>
            <Link to={`/mypage`}>ショップ</Link>
        </button>
        <button className='cart_button'>
            <Link to={`/${userData?.id}/cart`}>カート</Link>
        </button>
        <button className='logout_button' onClick={handleLogout}>
            <Link to={`/`}>ログアウト</Link>
        </button>
        </div>
                      
                      
        ) : ( 
          <div >
            <button className='login_button'>
              <Link to="/login">ログイン</Link>
              </button>
            <button className='signup_button'>
              <Link to="/signup" >新規登録</Link>
              </button>
          </div>
        )}
      
      </div>
    </header>
  )
}

export default Navigation
