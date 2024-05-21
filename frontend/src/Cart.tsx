import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Button,
    Checkbox,
    FormControlLabel,
    TextField,
    Typography,
} from '@mui/material'; // Material-UIのコンポーネントをインポート

interface userDataProps {
    id: number;
    name: string;
    email: string;
}

interface cartDataProps {
    shohin_id: number;
    shohin_mei: string;
    hanbai_tanka: number;
    sum_quantity: number;
    user_id: any;
    id: number;
    url: string;
}

const Cart = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['token']);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<userDataProps | null>(null);
    const [cartData, setCartData] = useState<cartDataProps[] | null>(null);
    const [updatedQuantities, setUpdatedQuantities] = useState<{ [key: number]: number }>({});
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

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
                    const cartResponse = await axios.get(`http://localhost:8000/shop/${response.data.id}/cart`, {
                        headers: {
                            Authorization: `Bearer ${cookies.token}`
                        }
                    });
                    setCartData(cartResponse.data);
                } else {
                    setIsLoggedIn(false);
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchData();
        
    }, [cookies, navigate,]);

    const handleLogout = () => {
        removeCookie('token');
        navigate('/');
    };
    const handleSubmit = async () => {
        try {
            if (!userData) return;
            for (const item of cartData || []) {
                const shohin_id = item.shohin_id;
                const quantity = updatedQuantities[shohin_id];
               
                if (quantity !== undefined) {
                    console.log(updatedQuantities[shohin_id]); // quantity の値を出力

                    await axios.put(
                        `http://localhost:8000/shop/${userData.id}/cart`,
                        { shohin_id, quantity },
                        { headers: { Authorization: `Bearer ${cookies.token}` } }
                    );
                }
            }

            navigate(`/${userData.id}/cart`);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };


    const handleQuantityChange = async (shohin_id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const quantity = parseInt(e.target.value);
        // 数量が0の場合は元の数量を保持する
        const originalQuantity = parseInt(String(cartData?.find(item => item.shohin_id === shohin_id)?.sum_quantity || 0));
        setUpdatedQuantities(prevState => ({
            ...prevState,
            [shohin_id]: quantity === 0 ? originalQuantity : quantity
        }));
        await handleSubmit()
        if(userData){
            navigate(`/${userData.id}/cart`);
        }
    };
    useEffect(() => {
        console.log(cartData,"cartdata")
        console.log(updatedQuantities,"updatequantities")
    },[updatedQuantities,cartData])

    const handleItemSelection =  (shohin_id: number) => {
        setSelectedItems(prevState => {
            if (prevState.includes(shohin_id)) {
                return prevState.filter(item => item !== shohin_id);
            } else {
                return [...prevState, shohin_id];
            }
        });
    };

    const handleDeleteSelectedItems = async () => {
        try {
            await Promise.all(selectedItems.map(async (shohin_id) => {
                await axios.delete(
                    `http://localhost:8000/shop/${userData?.id}/cart`,
                    {
                        data: { shohin_id },
                        headers: { Authorization: `Bearer ${cookies.token}` }
                    }
                );
            }));
            // 削除後にカートデータを再取得する
            const cartResponse = await axios.get(`http://localhost:8000/shop/${userData?.id}/cart`, {
                headers: {
                    Authorization: `Bearer ${cookies.token}`
                }
            });
            setCartData(cartResponse.data);
        } catch (error) {
            console.error('Error deleting items:', error);
        }
    };
    

   

    const totalAmount = () => {
        let total = 0;
        if (cartData !== null) {
            cartData.forEach((item: cartDataProps) => {
                total += item.hanbai_tanka * item.sum_quantity;
            });
        }
        return total;
    };
    const a = 1
    
    
    return (
        <div>
            {isLoggedIn ? (
                <>
                    <Typography variant="h3">CART</Typography>
                    <Typography variant="h5">{cartData && <Link to={`/${userData?.id}`}>プロフィール</Link>}</Typography>
                    <Typography>{userData?.name}様</Typography>
                    <form onSubmit={handleSubmit}>
                        {cartData !== null && cartData.length > 0 ? (
                            cartData.map((item, index) => (
                                <div key={index}>
                                    <Typography variant="h3">{item.shohin_mei}</Typography>
                                    <Typography>{item.hanbai_tanka}円</Typography>
                                    <img src={`${item.url}`} alt="" width={100} height={100} />
                                    <TextField
                                        type="number"
                                        value={updatedQuantities[item.shohin_id] || item.sum_quantity}
                                        onChange={(e) => handleQuantityChange(item.shohin_id, e)}
                                    />
                                    <Typography>個</Typography>
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={selectedItems.includes(item.shohin_id)}
                                            onChange={() => handleItemSelection(item.shohin_id)}
                                        />}
                                        label="この商品を削除"
                                    />
                                </div>
                            ))
                        ) : (
                            <Typography>データがありません</Typography>
                        )}
                        <Button type="button" onClick={handleDeleteSelectedItems}>選択した商品を削除</Button>
                        <Button type="submit">カートを更新</Button>
                    </form>
                    <div>
                        <Typography>{totalAmount()}円</Typography>
                    </div>
                    <div>
                        <Button onClick={handleLogout}>Logout</Button>
                    </div>
                </>
            ) : (
                <Typography>Please wait, verifying login...</Typography>
            )}
        </div>
    );
};

export default Cart;
