"use client"

import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
    }, [cookies, navigate]);

    const handleLogout = () => {
        removeCookie('token');
        navigate('/');
    };
    

   
  return (
    <header >
      <div >    
      {cookies.token ? (
        <>                      
        <button>
            <Link to={`/mypage`}>マイページ</Link>
        </button>
        <button>
            <Link to={`/${userData?.id}/cart`}>カート</Link>
        </button>
        <button onClick={handleLogout}>
            <Link to={`/`}>ログアウト</Link>
        </button>
        </>
                      
                      
        ) : ( 
          <div >
            <button>
              <Link to="/login">ログイン</Link>
              </button>
            <button>
              <Link to="/signup" >新規登録</Link>
              </button>
          </div>
        )}
      
      </div>
    </header>
  )
}

export default Navigation
