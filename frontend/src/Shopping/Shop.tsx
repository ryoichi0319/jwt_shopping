import React, { FormEvent, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface ShopItemProps {
  shohin_mei: string;
  hanbai_tanka: number;
  url: string;
  shohin_id: number;
  user_id: number;
}

const Shop: React.FC<{ id: any  }> = ({ id,  }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shohins, setShohin] = useState<ShopItemProps[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(`http://localhost:8000/shop`);
        setShohin(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchData();
  }, []);

  const addToCart = async (e: React.FormEvent,
     shohin_id: number, quantity: number, hanbai_tanka: number,
      shohin_mei: string,user_id:number,url: string) => {
    try {
      e.preventDefault(); // フォームのデフォルトの動作をキャンセル
      axios.defaults.withCredentials = true;
      if (cookies.token) {
        setIsLoggedIn(true);
        // カートに商品を追加
        await axios.post(
          `http://localhost:8000/shop/${id}/cart`,
          {
            shohin_id: shohin_id,
            quantity: quantity,
            hanbai_tanka: hanbai_tanka,
            shohin_mei: shohin_mei,
            user_id: id,
            url: url

          },
          {
            headers: {
              Authorization: `Bearer ${cookies.token}`
            }
          }
        );
        // カートにアイテムを追加した後、商品データを再取得
        const response = await axios.get(`http://localhost:8000/shop`);
        setShohin(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  return (
    <div>
      {shohins !== null && shohins.length > 0 ? (
        shohins.map((item) => (
          <div key={item.shohin_id}>
            <h3>{item.shohin_mei}</h3>
            <p>{item.hanbai_tanka}</p>
            <img src={`${item.url}`} alt="" width={100} height={100} />
            <form onSubmit={(e) => {
              e.preventDefault();
              const quantity = parseInt(e.currentTarget.quantity.value);
              addToCart(e,item.shohin_id, quantity,
                 item.hanbai_tanka, item.shohin_mei,item.user_id,item.url);
            }}>
              <select name="quantity">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <button type="submit">カートに追加</button>
            </form>
          </div>
        ))
      ) : (
        <p>データがありません</p>
      )}
    </div>
  );
};

export default Shop;
