import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Shop from './Shopping/Shop';
interface UserProfileProps {
    id: number;
    name: string;
    email: string;
   
}

const MyPage = () => {
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
                    navigate('/');
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
        <div>
            {isLoggedIn ? (
                <>
                <h1>Welcome to My Page</h1>
                 <h2>{userData && <Link to={`/${userData?.id}`}>プロフィール</Link>}</h2>   
                <p>{userData?.name}様</p>
                <p>{userData?.email}</p> 
                    <div>
                    <Shop id={userData?.id}/>

                    </div>
                    <div>
                        <br />
                    <button onClick={handleLogout}>Logout</button>

                    </div>
                </>
            ) : (
                <p>Please wait, verifying login...</p>
            )}
        </div>
    );
};

export default MyPage;
