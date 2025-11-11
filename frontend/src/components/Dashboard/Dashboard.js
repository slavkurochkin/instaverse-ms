import React, { useState, useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Highlighter from 'react-highlight-words';

import {
  Space,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Card,
  message,
  Divider,
  Select,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getUserProfiles } from '../../actions/profile';
import { updateUser, deleteUser } from '../../actions/authentication';
import {
  getStories,
  deleteUserStories,
  deleteUserComments,
} from '../../actions/stories';
import { Pie, Line } from 'react-chartjs-2'; // Import Line chart
import { Filler } from 'chart.js';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Add this
  BarController, // Add this
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Add this
  BarController, // Add this
);

const initialData = [];

function Dashboard() {
  const [data, setData] = useState(initialData);

  ChartJS.register(Filler);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [storiesData, setStoriesData] = useState([]);
  const [form] = Form.useForm();
  const searchInput = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchText, setSearchText] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsersData = async () => {
      const profiles = await dispatch(getUserProfiles());
      setAllUsersData(profiles);
    };
    fetchUsersData();

    const fetchStoriesData = async () => {
      const stories = await dispatch(getStories());
      setStoriesData(stories);
    };
    fetchStoriesData();
  }, [dispatch]);

  const calculateTotalPosts = () => {
    const users = allUsersData.length ? allUsersData : data;
    return users.reduce((sum, user) => sum + (user.totalPosts || 0), 0);
  };

  const calculateTotalUsers = () => allUsersData.length;

  const getFavoriteStylesData = () => {
    const totalUsers = allUsersData.length;
    const styleCounts = allUsersData.reduce((acc, user) => {
      const style = user.favorite_style || 'Unknown';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(styleCounts);
    const values = Object.values(styleCounts).map(
      (count) => ((count / totalUsers) * 100).toFixed(0), // Calculate percentage
    );

    return {
      labels,
      datasets: [
        {
          label: 'Favorite Styles (%)',
          data: values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
          hoverOffset: 4,
        },
      ],
    };
  };

  const getPostsByMonthData = () => {
    if (!storiesData || storiesData.length === 0) {
      return { labels: [], datasets: [] }; // Return an empty chart if there are no stories
    }

    const monthCounts = storiesData.reduce((acc, story) => {
      const postDate = new Date(story.postDate); // Ensure the date is being parsed correctly

      if (isNaN(postDate)) {
        console.error('Invalid date:', story.postDate);
        return acc;
      }

      const month = postDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // If no months are counted, return empty data
    if (Object.keys(monthCounts).length === 0) {
      return { labels: [], datasets: [] };
    }

    const sortedMonths = Object.keys(monthCounts).sort(
      (a, b) => new Date(a) - new Date(b),
    );
    const values = sortedMonths.map((month) => monthCounts[month]);

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Posts by Month',
          data: values,
          borderColor: '#37ebc1',
          backgroundColor: 'rgba(20, 225, 201, 0.46)',
          fill: true,
        },
      ],
    };
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const updatedRecord = { ...editingRecord, ...values };

      try {
        await dispatch(updateUser(updatedRecord));

        const newData = editingRecord._id
          ? allUsersData.map((item) =>
              item._id === editingRecord._id ? updatedRecord : item,
            )
          : data.map((item) =>
              item.key === editingRecord.key ? updatedRecord : item,
            );

        editingRecord._id ? setAllUsersData(newData) : setData(newData);

        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        message.success('Record updated successfully!');
      } catch (error) {
        message.error(`Failed to update record! Error: ${error.message}`);
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleDelete = async (key, isAllUsersTable = false) => {
    try {
      await dispatch(deleteUserComments(key));
      await dispatch(deleteUserStories(key));
      await dispatch(deleteUser(key));

      const newData = isAllUsersTable
        ? allUsersData.filter((item) => item._id !== key)
        : data.filter((item) => item.key !== key);

      isAllUsersTable ? setAllUsersData(newData) : setData(newData);

      // Re-fetch stories data after deletion to update the line chart
      const updatedStories = await dispatch(getStories());
      setStoriesData(updatedStories); // Update stories data in the state

      message.success('Record deleted successfully!');
    } catch (error) {
      message.error(`Failed to delete record! Error: ${error.message}`);
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownOpenChange: (open) => {
      if (open) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    confirm({ closeDropdown: false });
  };

  const renderActions = (record, isAllUsersTable = false) => (
    <Space size="middle">
      <Button onClick={() => handleEdit(record, isAllUsersTable)}>Edit</Button>
      <Button
        danger
        onClick={() => {
          if (record.role !== 'admin') {
            // Check if the user is not an admin
            Modal.confirm({
              title: 'Are you sure you want to delete this user?',
              content: 'This will remove all user posts and comments',
              okText: 'Delete', // Change 'OK' to 'Delete'
              okType: 'danger', // Apply 'danger' type to make the button red
              onOk: () =>
                handleDelete(
                  isAllUsersTable ? record._id : record.key,
                  isAllUsersTable,
                ),
            });
          }
        }}
        disabled={record.role === 'admin'} // Disable the button if the role is 'admin'
      >
        Delete
      </Button>
    </Space>
  );

  const usersTableColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps('username'),
    },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      filters: [
        { text: '0-17', value: '0-17' },
        { text: '18-34', value: '18-34' },
        { text: '35-54', value: '35-54' },
        { text: '55+', value: '55+' },
      ],
      onFilter: (value, record) => {
        const age = record.age;
        if (value === '0-17') return age <= 17;
        if (value === '18-34') return age >= 18 && age <= 34;
        if (value === '35-54') return age >= 35 && age <= 54;
        if (value === '55+') return age >= 55;
        return false;
      },
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
        { text: 'Other', value: 'Other' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Favorite Style',
      dataIndex: 'favorite_style',
      key: 'favorite_style',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Total Posts',
      dataIndex: 'totalPosts',
      key: 'totalPosts',
      render: (text) => text || '0',
      sorter: (a, b) => (a.totalPosts || 0) - (b.totalPosts || 0),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => renderActions(record, true),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: 24 }}>
        <Card title="Statistics" style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p>Total Users</p>
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {calculateTotalUsers()}
              </p>
            </div>
            <Divider
              type="vertical"
              style={{ height: '100%', margin: '0 10px' }}
            />
            <div style={{ textAlign: 'center' }}>
              <p>Total Posts</p>
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {calculateTotalPosts()}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Favorite Styles Distribution" style={{ flex: 2 }}>
          <Pie
            data={getFavoriteStylesData()}
            options={{
              plugins: {
                tooltip: {
                  enabled: true,
                },
                legend: {
                  display: true,
                },
                hover: {
                  mode: 'nearest',
                  intersect: true,
                },
              },
            }}
          />
        </Card>
        <Card title="Posts by Month" style={{ flex: 3 }}>
          <Line data={getPostsByMonthData()} />
        </Card>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: 24 }}>
        <Card title="User Age Groups" style={{ flex: 2 }}>
          {allUsersData && allUsersData.length > 0 ? (
            <Bar
              data={{
                labels: ['0-17', '18-34', '35-54', '55+'],
                datasets: [
                  {
                    label: 'Users by Age Group',
                    data: (() => {
                      const ageGroups = {
                        '0-17': 0,
                        '18-34': 0,
                        '35-54': 0,
                        '55+': 0,
                      };

                      allUsersData.forEach((user) => {
                        const age = user.age;
                        if (age <= 17) ageGroups['0-17']++;
                        else if (age <= 34) ageGroups['18-34']++;
                        else if (age <= 54) ageGroups['35-54']++;
                        else ageGroups['55+']++;
                      });

                      return Object.values(ageGroups);
                    })(),
                    backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                      '#4BC0C0',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) =>
                        `${tooltipItem.dataset.label}: ${tooltipItem.raw} users`,
                    },
                  },
                },
              }}
              style={{ height: '100%' }} // Make the chart fill the card
            />
          ) : (
            <p>No user data available</p>
          )}
        </Card>
        <Card title="User Gender Distribution" style={{ flex: 2 }}>
          {allUsersData && allUsersData.length > 0 ? (
            <Bar
              data={{
                labels: ['Male', 'Female', 'Other'],
                datasets: [
                  {
                    label: 'Users by Gender',
                    data: (() => {
                      const genderCounts = {
                        male: 0,
                        female: 0,
                        Other: 0,
                      };

                      allUsersData.forEach((user) => {
                        const gender = user.gender;
                        if (genderCounts[gender] !== undefined) {
                          genderCounts[gender]++;
                        } else {
                          genderCounts['Other']++;
                        }
                      });

                      return Object.values(genderCounts);
                    })(),
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                indexAxis: 'y', // Makes the bar chart horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) =>
                        `${tooltipItem.dataset.label}: ${tooltipItem.raw} users`,
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true, // Ensure the x-axis starts at 0
                  },
                },
              }}
              style={{ height: '100%' }} // Make the chart fill the card
            />
          ) : (
            <p>No user data available</p>
          )}
        </Card>
      </div>
      <Modal
        title="Edit User"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input the email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please input the age!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ required: true, message: 'Please input the bio!' }]}
          >
            <Input />
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
        </Form>
      </Modal>

      <Card title="All Users Data" style={{ marginTop: 24 }}>
        <Table
          columns={usersTableColumns}
          dataSource={allUsersData}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

export default Dashboard;
