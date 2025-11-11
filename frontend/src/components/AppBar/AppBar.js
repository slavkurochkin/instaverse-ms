import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  ArrowRightOutlined,
  DashboardTwoTone,
  HomeOutlined,
} from '@ant-design/icons';
import { Layout, Image, Typography, Button, Dropdown } from 'antd';
import Logo from '../../images/instavers.png';
import { useDispatch } from 'react-redux';
import {
  LOGOUT,
  OPEN_DASHBOARD,
  FETCH_PROFILE,
} from '../../constants/actionTypes';
import { jwtDecode } from 'jwt-decode';
import NotificationBell from '../Notifications/NottificationBell';

import styles from './styles';

const { Title } = Typography;
const { Header } = Layout;

export default function AppBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));

  const logout = useCallback(() => {
    dispatch({ type: LOGOUT });
    navigate('/authform');
    setUser(null);
  }, [dispatch, navigate]);

  const navigateToDashboard = useCallback(() => {
    dispatch({ type: OPEN_DASHBOARD });
    navigate('/dashboard');
  }, [dispatch, navigate]);

  const navigateToProfile = useCallback(() => {
    dispatch({ type: FETCH_PROFILE });
    navigate('/profile');
  }, [dispatch, navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const token = user?.token;

    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) logout();
    }

    setUser(JSON.parse(localStorage.getItem('profile')));
  }, [location, logout, user?.token]);

  // Define menu items
  const items = [
    {
      key: '0',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: navigateToHome,
    },
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: navigateToProfile,
    },
    {
      key: '3',
      icon: <ArrowRightOutlined />,
      label: 'Log Out',
      danger: true,
      onClick: logout,
    },
  ];

  // Conditionally add an item for admin
  if (user?.result?.role === 'admin') {
    items.splice(2, 0, {
      key: '2',
      icon: <DashboardTwoTone />,
      label: 'Dashboard',
      onClick: navigateToDashboard,
    });
  }

  return (
    <Header style={styles.header}>
      <Link to="/">
        <div style={styles.homeLink}>
          <Image style={styles.image} preview={false} src={Logo} width={45} />
          &nbsp;
          <Title style={styles.title}>instaverse</Title>
        </div>
      </Link>
      {!user ? (
        <Link to="/authform">
          <Button htmlType="button" size="large" style={styles.login}>
            Log In
          </Button>
        </Link>
      ) : (
        <div style={styles.userInfo}>
          <NotificationBell userId={user?.result?._id} />{' '}
          {/* Notification bell appears only when user is logged in */}
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button htmlType="button" size="large" icon={<UserOutlined />}>
              {user?.result?.username}
            </Button>
          </Dropdown>
        </div>
      )}
    </Header>
  );
}
