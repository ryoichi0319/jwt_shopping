import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  id: number;
  name: string;
  email: string;
}


const MyPage2: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URLからパラメーターを文字列として取得
  const [user, setUser] = useState<UserProfileProps | null>(null); // user ステートの型を修正
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        axios.defaults.withCredentials = true;

        const response = await axios.get<UserProfileProps>(
          `http://localhost:8000/auth/${id}`,
          {
            headers: {
              Authorization: `Bearer ${cookies.token}` // リクエストヘッダーにトークンを含める
            }
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        // navigate('/');
         // エラーが発生した場合はログインページにリダイレクト
      }
    };

    fetchUser(); // コンポーネントがマウントされたときにユーザー情報を取得
  }, [id, cookies.token, navigate]);

  if (!user) {
    return <div>アクセス権がありません</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>ID: {user.id}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default MyPage2;
