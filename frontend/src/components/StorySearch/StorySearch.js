import React, { useState } from 'react';
import { Input, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import styles from './styles';
import { getStories, fetchStoriesByTag } from '../../actions/stories';

const { Search } = Input;

export default function StorySearch() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onSearch = (value) => {
    setLoading(true); // Show spinner when search starts
    if (value) {
      dispatch(fetchStoriesByTag(value.toLowerCase())).finally(() =>
        setLoading(false),
      ); // Hide spinner after fetch
    } else {
      dispatch(getStories()).finally(() => setLoading(false)); // Hide spinner after fetch
    }
  };

  const contentStyle = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  };

  const content = <div style={contentStyle} />;

  return (
    <div>
      {loading && (
        <div style={styles.spinnerMask}>
          <Spin tip="Loading" size="large">
            {content}
          </Spin>
        </div>
      )}
      <div style={styles.search}>
        <Search
          placeholder="Search by tag"
          allowClear
          enterButton="Search"
          size="large"
          onSearch={onSearch}
        />
      </div>
    </div>
  );
}
