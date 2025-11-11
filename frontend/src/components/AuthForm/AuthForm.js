import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Layout,
  Typography,
  DatePicker,
  Select,
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { login, signup } from '../../actions/authentication';

import styles from './styles';
import TextArea from 'antd/es/input/TextArea';

const { Title } = Typography;

function AuthForm() {
  // const user = null;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [isLogin, setIsLogin] = useState(true);

  const onSubmit = (formValues) => {
    if (isLogin) {
      dispatch(login(formValues, navigate));
    } else {
      dispatch(signup(formValues, navigate));
    }
  };

  const switchMode = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
  };

  return (
    <Layout style={styles.container}>
      <Card
        style={styles.card}
        title={
          <Title level={4} style={{ textAlign: 'center' }}>
            {isLogin ? 'Login to' : 'Join'} instaverse
          </Title>
        }
      >
        <Form
          name="authform"
          form={form}
          size="large"
          wrapperCol={{ span: 20, offset: 2 }}
          onFinish={onSubmit}
        >
          {isLogin || (
            <>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your username',
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="username" />
              </Form.Item>
              <Form.Item
                name="age"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your age',
                  },
                ]}
              >
                <DatePicker placeholder="date of birth" />
              </Form.Item>
              <Form.Item
                name="gender"
                rules={[
                  {
                    required: true,
                    message: 'Please select gender',
                  },
                ]}
              >
                <Select placeholder="gender">
                  <Select.Option value="female">female</Select.Option>
                  <Select.Option value="male">male</Select.Option>
                  <Select.Option value="other">other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="bio"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your bio',
                  },
                ]}
              >
                <TextArea prefix={<UserOutlined />} placeholder="bio" />
              </Form.Item>
              <Form.Item
                name="favorite_style"
                rules={[
                  {
                    required: true,
                    message: 'Please select a category',
                  },
                ]}
              >
                <Select placeholder="favorite style">
                  <Select.Option value="animals">Animals</Select.Option>
                  <Select.Option value="nature">Nature</Select.Option>
                  <Select.Option value="portrait">Portrait</Select.Option>
                  <Select.Option value="sport">Sport</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please enter valid email address',
              },
            ]}
          >
            <Input
              type="email"
              prefix={<MailOutlined />}
              placeholder="email address"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please enter your password',
              },
            ]}
          >
            <Input.Password
              type="password"
              prefix={<LockOutlined />}
              placeholder="password"
            />
          </Form.Item>
          {isLogin || (
            <Form.Item
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: 'Please repeat your password',
                },
              ]}
            >
              <Input.Password
                type="password"
                prefix={<LockOutlined />}
                placeholder="confirm password"
              />
            </Form.Item>
          )}
          <Form.Item>
            <Button htmlType="submit" typeof="primary">
              {isLogin ? 'Log In' : 'Join'}
            </Button>
            <span style={{ margin: '0 10px 0px 20px' }}>Or</span>
            <Button type="link" onClick={switchMode}>
              {isLogin ? 'Register now' : 'have an account?'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
}

export default AuthForm;
