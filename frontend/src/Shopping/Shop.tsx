import React, { FormEvent, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './shop.css';

interface ShopItemProps {
  shohin_mei: string;
  hanbai_tanka: number;
  url: string;
  shohin_id: number;
  user_id: number;
}

const Shop: React.FC<{ id: any }> = ({ id }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shohins, setShohins] = useState<ShopItemProps[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.get('http://localhost:8000/shop');
        setShohins(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);

  const addToCart = async (
    e: FormEvent,
    shohin_id: number,
    quantity: number,
    hanbai_tanka: number,
    shohin_mei: string,
    user_id: number,
    url: string
  ) => {
    e.preventDefault();

    try {
      axios.defaults.withCredentials = true;
      if (cookies.token) {
        setIsLoggedIn(true);
        await axios.post(
          `http://localhost:8000/shop/${id}/cart`,
          {
            shohin_id,
            quantity,
            hanbai_tanka,
            shohin_mei,
            user_id: id,
            url,
          },
          {
            headers: {
              Authorization: `Bearer ${cookies.token}`,
            }
          }
        );
        // 再度商品データを取得してステートを更新
        const response = await axios.get('http://localhost:8000/shop');
        setShohins(response.data);
        navigate(`/${id}/cart`)
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

 
 
  return (
    <div className='shop_container'>
      <div className='shop'>
        {shohins !== null && shohins.length > 0 ? (
          shohins.map((item) => (
            <div key={item.shohin_id} className='shop_item'>
              <h3>{item.shohin_mei}</h3>
              <p>{item.hanbai_tanka}</p>
              <img src={item.url} alt={item.shohin_mei} width={100} height={100} />
              <form
                onSubmit={(e) => addToCart(e, item.shohin_id, parseInt(e.currentTarget.quantity.value), item.hanbai_tanka, item.shohin_mei, item.user_id, item.url)}
              >
                <select name='quantity'>
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                </select>
                <button type='submit'>カートに追加</button>
              </form>
            </div>
          ))
        ) : (
          <p>データがありません</p>
        )}
      </div>
    </div>
  );
};

export default Shop;
// function concat(aa: string[]): any {
//   throw new Error('Function not implemented.');
// }

