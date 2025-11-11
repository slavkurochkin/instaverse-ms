import React, { useState, useRef, useEffect } from 'react';
import {
  Space,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Card,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import Highlighter from 'react-highlight-words';
import DeleteConfirmationModal from '../DeleteConfirmationModal/index'; // Adjust the path as necessary
import MonthlyPostsChart from '../Charts/MonthlyPostChart'; // Adjust the path as necessary
import TagsChart from '../Charts/TagsChart'; // Import TagsChart component
import { getUserProfiles } from '../../actions/profile';

const initialData = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: '123 Main St, New York',
    tags: ['nature', 'portrait'],
    postsPerMonth: {
      January: 5,
      February: 3,
      March: 6,
      April: 4,
      May: 7,
      June: 5,
      July: 4,
      August: 6,
      September: 5,
      October: 7,
      November: 4,
      December: 8,
    },
    totalPosts: 64,
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: '456 Elm St, London',
    tags: ['sport', 'animals'],
    postsPerMonth: {
      January: 6,
      February: 4,
      March: 5,
      April: 3,
      May: 6,
      June: 5,
      July: 7,
      August: 4,
      September: 6,
      October: 5,
      November: 3,
      December: 6,
    },
    totalPosts: 60,
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 29,
    address: '789 Maple St, Sydney',
    tags: ['nature', 'animals'],
    postsPerMonth: {
      January: 4,
      February: 5,
      March: 6,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 5,
      September: 4,
      October: 6,
      November: 5,
      December: 7,
    },
    totalPosts: 60,
  },
  {
    key: '4',
    name: 'Sara White',
    age: 42,
    address: '101 Oak St, Tokyo',
    tags: ['portrait', 'sport'],
    postsPerMonth: {
      January: 5,
      February: 3,
      March: 7,
      April: 5,
      May: 6,
      June: 4,
      July: 6,
      August: 5,
      September: 7,
      October: 4,
      November: 5,
      December: 6,
    },
    totalPosts: 63,
  },
  {
    key: '5',
    name: 'Jim Green',
    age: 28,
    address: '202 Pine St, Paris',
    tags: ['nature'],
    postsPerMonth: {
      January: 6,
      February: 5,
      March: 4,
      April: 6,
      May: 5,
      June: 7,
      July: 5,
      August: 4,
      September: 6,
      October: 5,
      November: 7,
      December: 4,
    },
    totalPosts: 64,
  },
  {
    key: '6',
    name: 'Emma Brown',
    age: 40,
    address: '303 Cedar St, Berlin',
    tags: ['sport', 'portrait'],
    postsPerMonth: {
      January: 7,
      February: 4,
      March: 6,
      April: 5,
      May: 4,
      June: 6,
      July: 5,
      August: 7,
      September: 4,
      October: 5,
      November: 6,
      December: 4,
    },
    totalPosts: 63,
  },
  {
    key: '7',
    name: 'James Wilson',
    age: 36,
    address: '404 Birch St, Madrid',
    tags: ['animals'],
    postsPerMonth: {
      January: 5,
      February: 6,
      March: 4,
      April: 6,
      May: 5,
      June: 4,
      July: 6,
      August: 5,
      September: 7,
      October: 6,
      November: 4,
      December: 5,
    },
    totalPosts: 63,
  },
  {
    key: '8',
    name: 'Olivia Smith',
    age: 30,
    address: '505 Spruce St, Rome',
    tags: ['sport'],
    postsPerMonth: {
      January: 6,
      February: 5,
      March: 7,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 4,
      September: 5,
      October: 6,
      November: 7,
      December: 5,
    },
    totalPosts: 67,
  },
  {
    key: '9',
    name: 'Liam Johnson',
    age: 25,
    address: '606 Willow St, Athens',
    tags: ['portrait'],
    postsPerMonth: {
      January: 5,
      February: 6,
      March: 4,
      April: 7,
      May: 5,
      June: 6,
      July: 4,
      August: 7,
      September: 5,
      October: 6,
      November: 4,
      December: 7,
    },
    totalPosts: 66,
  },
  {
    key: '10',
    name: 'Ava Brown',
    age: 32,
    address: '707 Aspen St, Moscow',
    tags: ['animals'],
    postsPerMonth: {
      January: 6,
      February: 4,
      March: 5,
      April: 6,
      May: 7,
      June: 5,
      July: 4,
      August: 6,
      September: 5,
      October: 7,
      November: 6,
      December: 5,
    },
    totalPosts: 66,
  },
  {
    key: '11',
    name: 'Noah Davis',
    age: 29,
    address: '808 Redwood St, Dubai',
    tags: ['sport'],
    postsPerMonth: {
      January: 5,
      February: 6,
      March: 4,
      April: 5,
      May: 7,
      June: 6,
      July: 4,
      August: 5,
      September: 6,
      October: 7,
      November: 5,
      December: 4,
    },
    totalPosts: 64,
  },
  {
    key: '12',
    name: 'Sophia Martinez',
    age: 27,
    address: '909 Sequoia St, Toronto',
    tags: ['nature', 'portrait'],
    postsPerMonth: {
      January: 6,
      February: 5,
      March: 4,
      April: 6,
      May: 5,
      June: 7,
      July: 4,
      August: 5,
      September: 6,
      October: 7,
      November: 4,
      December: 5,
    },
    totalPosts: 64,
  },
  {
    key: '13',
    name: 'Mason Lee',
    age: 34,
    address: '1010 Palm St, Beijing',
    tags: ['animals'],
    postsPerMonth: {
      January: 5,
      February: 7,
      March: 4,
      April: 5,
      May: 6,
      June: 4,
      July: 7,
      August: 5,
      September: 6,
      October: 4,
      November: 5,
      December: 6,
    },
    totalPosts: 64,
  },
  {
    key: '14',
    name: 'Isabella Anderson',
    age: 31,
    address: '1111 Fir St, New Delhi',
    tags: ['portrait', 'sport'],
    postsPerMonth: {
      January: 7,
      February: 5,
      March: 4,
      April: 6,
      May: 7,
      June: 5,
      July: 6,
      August: 4,
      September: 5,
      October: 6,
      November: 4,
      December: 7,
    },
    totalPosts: 66,
  },
  {
    key: '15',
    name: 'Ethan Harris',
    age: 38,
    address: '1212 Pine St, Cairo',
    tags: ['nature'],
    postsPerMonth: {
      January: 6,
      February: 4,
      March: 7,
      April: 5,
      May: 6,
      June: 4,
      July: 5,
      August: 7,
      September: 4,
      October: 6,
      November: 5,
      December: 7,
    },
    totalPosts: 66,
  },
  {
    key: '16',
    name: 'Mia Clark',
    age: 26,
    address: '1313 Elm St, Sao Paulo',
    tags: ['sport', 'animals'],
    postsPerMonth: {
      January: 5,
      February: 7,
      March: 6,
      April: 5,
      May: 4,
      June: 6,
      July: 5,
      August: 7,
      September: 6,
      October: 5,
      November: 4,
      December: 6,
    },
    totalPosts: 66,
  },
  {
    key: '17',
    name: 'Lucas Walker',
    age: 37,
    address: '1414 Maple St, Buenos Aires',
    tags: ['portrait'],
    postsPerMonth: {
      January: 4,
      February: 5,
      March: 6,
      April: 7,
      May: 5,
      June: 4,
      July: 6,
      August: 5,
      September: 7,
      October: 6,
      November: 4,
      December: 5,
    },
    totalPosts: 64,
  },
  {
    key: '18',
    name: 'Amelia Robinson',
    age: 33,
    address: '1515 Birch St, Rio de Janeiro',
    tags: ['animals'],
    postsPerMonth: {
      January: 7,
      February: 5,
      March: 6,
      April: 4,
      May: 7,
      June: 5,
      July: 4,
      August: 6,
      September: 5,
      October: 7,
      November: 6,
      December: 4,
    },
    totalPosts: 67,
  },
  {
    key: '19',
    name: 'Henry King',
    age: 41,
    address: '1616 Cedar St, Cape Town',
    tags: ['sport'],
    postsPerMonth: {
      January: 5,
      February: 6,
      March: 4,
      April: 7,
      May: 5,
      June: 4,
      July: 6,
      August: 5,
      September: 7,
      October: 4,
      November: 5,
      December: 6,
    },
    totalPosts: 64,
  },
  {
    key: '20',
    name: 'Emily Wright',
    age: 29,
    address: '1717 Willow St, Nairobi',
    tags: ['nature', 'portrait'],
    postsPerMonth: {
      January: 6,
      February: 5,
      March: 4,
      April: 7,
      May: 6,
      June: 5,
      July: 4,
      August: 6,
      September: 5,
      October: 7,
      November: 6,
      December: 5,
    },
    totalPosts: 66,
  },
];

function Dashboard() {
  const [data, setData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [totalPostsData, setTotalPostsData] = useState({});
  const [tagsData, setTagsData] = useState([]);

  const user = JSON.parse(localStorage.getItem('profile'));
  const searchInput = useRef(null);

  useEffect(() => {
    const totalPosts = {};
    data.forEach((user) => {
      Object.keys(user.postsPerMonth).forEach((month) => {
        if (totalPosts[month]) {
          totalPosts[month] += user.postsPerMonth[month];
        } else {
          totalPosts[month] = user.postsPerMonth[month];
        }
      });
    });
    setTotalPostsData(totalPosts);

    const tagsCount = {};
    data.forEach((user) => {
      user.tags.forEach((tag) => {
        if (tagsCount[tag]) {
          tagsCount[tag]++;
        } else {
          tagsCount[tag] = 1;
        }
      });
    });

    const tagsChartData = Object.keys(tagsCount).map((tag) => ({
      tag: tag,
      count: tagsCount[tag],
    }));

    setTagsData(tagsChartData);
  }, [data]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsersData = async () => {
      const profiles = await dispatch(getUserProfiles()); // Fetch user profile

      // Store the user profiles in local state
      // setUserProfile(profiles);
    };

    fetchUsersData();
  }, [dispatch]);

  const handleDelete = (key) => {
    const newData = data.filter((item) => item.key !== key);
    setData(newData);
    setIsDeleteModalVisible(false);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newData = data.map((item) =>
        item.key === editingRecord.key ? { ...item, ...values } : item,
      );
      setData(newData);
      setIsModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const showDeleteModal = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setRecordToDelete(null);
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

  const handleReset = (clearFilters, confirm, dataIndex) => {
    clearFilters();
    setSearchText('');
    setSearchedColumn('');
    confirm({ closeDropdown: false });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
      ...getColumnSearchProps('age'),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Category',
      key: 'tags',
      dataIndex: 'tags',
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'sport') {
              color = 'volcano';
            } else if (tag === 'portrait') {
              color = 'purple';
            } else if (tag === 'nature') {
              color = 'green';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Total Posts',
      dataIndex: 'totalPosts',
      key: 'totalPosts',
      sorter: (a, b) => a.totalPosts - b.totalPosts,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => showDeleteModal(record)} danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (!user) return <div>Not logged in</div>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        margin: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        <Card
          title="Total Posts"
          style={{ flex: 1, padding: '10px', minHeight: '200px' }}
        >
          <MonthlyPostsChart postsPerMonth={totalPostsData} />
        </Card>
        <Card
          title="Category Distribution"
          style={{ flex: 1, padding: '10px', minHeight: '200px' }}
        >
          <TagsChart tagsData={tagsData} />
        </Card>
        {/* New Card for Total Number of Posts */}
        <Card
          title="Total Number of Posts"
          style={{ flex: 1, padding: '10px', minHeight: '200px' }}
        >
          <p
            style={{
              textAlign: 'center',
              fontSize: '124px',
              fontStyle: 'bold',
            }}
          >
            {data.reduce((acc, curr) => acc + curr.totalPosts, 0)}
          </p>
        </Card>
      </div>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
      <Modal
        title="Edit Record"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please input the age!' }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
        {editingRecord && (
          <MonthlyPostsChart postsPerMonth={editingRecord.postsPerMonth} />
        )}
      </Modal>
      <DeleteConfirmationModal
        open={isDeleteModalVisible}
        onConfirm={handleDelete}
        onCancel={handleDeleteCancel}
        record={recordToDelete}
      />
    </div>
  );
}

export default Dashboard;
