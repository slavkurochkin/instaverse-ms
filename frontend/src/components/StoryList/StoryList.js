import React, { useState, useEffect } from 'react';
import { Row, Col, Empty, Button, Dropdown, Space, Input, Spin } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import Story from '../Story';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const { Search } = Input;

export default function StoryList({ setSelectedId }) {
  const [sortCriteria, setSortCriteria] = useState(''); // Default to no sorting
  const [sortOrder, setSortOrder] = useState(''); // No default sort order
  const [selectedCategory, setSelectedCategory] = useState('all'); // Default to show all categories
  const [searchQuery, setSearchQuery] = useState(''); // Default to no search query
  const [visibleCount, setVisibleCount] = useState(6); // Default to show 6 posts
  const [loading, setLoading] = useState(true); // Loading state
  const stories = useSelector((state) => state.stories);

  useEffect(() => {
    setLoading(true); // Start loading

    // Simulate fetching stories (you can replace this with an actual API call)
    setTimeout(() => {
      setLoading(false); // Set loading to false after stories are fetched
    }, 300); // Mock delay for fetching data

    // Scroll event listener to load more stories when reaching the bottom of the page
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        // Load more stories when user scrolls near the bottom
        setVisibleCount((prevCount) => prevCount + 6);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to sort stories based on criteria
  const sortStories = (stories) => {
    if (!sortCriteria) return stories; // If no sorting selected, return original stories

    return [...stories].sort((a, b) => {
      let comparison = 0;

      if (sortCriteria === 'likes') {
        const aLikes = (a.likes || []).length;
        const bLikes = (b.likes || []).length;
        comparison = sortOrder === 'asc' ? aLikes - bLikes : bLikes - aLikes;
      } else if (sortCriteria === 'date') {
        const aDate = new Date(a.postDate || 0).getTime();
        const bDate = new Date(b.postDate || 0).getTime();
        comparison = sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }

      return comparison;
    });
  };

  // Function to filter stories based on the selected category
  const filterStoriesByCategory = (stories) => {
    if (selectedCategory === 'all') {
      return stories;
    }
    return stories.filter(
      (story) =>
        story.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  };

  // Function to filter stories by search query (tags)
  const filterStoriesBySearch = (stories) => {
    if (!searchQuery) return stories; // If no search query, return original stories

    return stories.filter((story) =>
      (story.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  };

  // Get filtered and sorted stories
  const filteredStoriesByCategory = filterStoriesByCategory(stories);
  const filteredStoriesBySearch = filterStoriesBySearch(
    filteredStoriesByCategory,
  );
  const sortedStories = sortStories(filteredStoriesBySearch);

  // Handle sorting by likes
  const handleSortLikes = () => {
    setSortCriteria('likes');
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Handle sorting by date
  const handleSortDate = () => {
    setSortCriteria('date');
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Handle menu item click for category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.key);
  };

  // Handle resetting sorting, category, and search to default state
  const handleResetAll = () => {
    setSortCriteria(''); // Reset sorting
    setSortOrder(''); // Reset sort order
    setSelectedCategory('all'); // Reset category
    setSearchQuery(''); // Clear search field
    setVisibleCount(6); // Reset visible posts count
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const generateMenuItems = (
    menuItems,
    selectedCategory,
    handleCategoryChange,
  ) => {
    return menuItems.map((item) => ({
      key: item.key,
      label: item.label,
      onClick: handleCategoryChange, // Pass the handler here if needed
    }));
  };

  const categoryMenuItems = generateMenuItems(
    [
      { key: 'all', label: 'All Categories' },
      { key: 'animals', label: 'Animals' },
      { key: 'nature', label: 'Nature' },
      { key: 'portrait', label: 'Portrait' },
      { key: 'sport', label: 'Sport' },
    ],
    selectedCategory,
    handleCategoryChange,
  );

  // Function to render the sorting arrow icon
  const renderSortIcon = (criteria) => {
    if (sortCriteria !== criteria) return null;
    return sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />;
  };

  return (
    <div>
      {/* Search Input Field with Clear Icon and Search Button */}
      <Search
        placeholder="Search by tags"
        value={searchQuery}
        onChange={handleSearchChange}
        onSearch={setSearchQuery} // This triggers the search when pressing Enter or clicking the search button
        allowClear
        enterButton="Search"
        style={{ marginBottom: 16, width: '100%' }}
      />

      <Space style={{ marginBottom: 16 }}>
        {/* Sort by Likes Button */}
        <Button
          onClick={handleSortLikes}
          type={sortCriteria === 'likes' ? 'primary' : 'default'}
        >
          Sort by Likes {renderSortIcon('likes')}
        </Button>

        {/* Sort by Date Button */}
        <Button
          onClick={handleSortDate}
          type={sortCriteria === 'date' ? 'primary' : 'default'}
        >
          Sort by Date {renderSortIcon('date')}
        </Button>

        {/* Category Dropdown */}
        <Dropdown
          menu={{ items: categoryMenuItems }} // Replace `overlay` with `menu`
          trigger={['click']}
        >
          <Button>
            {selectedCategory === 'all'
              ? 'All Categories'
              : selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}{' '}
            <DownOutlined />
          </Button>
        </Dropdown>

        {/* Reset All Button */}
        <Button onClick={handleResetAll} type="default">
          Reset All
        </Button>
      </Space>

      {/* Render loading spinner if loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : // Render Stories
      sortedStories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Empty
            description={
              <span style={{ color: '#999' }}>No stories to show</span>
            }
          />
        </div>
      ) : (
        <Row gutter={[48, 32]}>
          {sortedStories.slice(0, visibleCount).map((story) => (
            <Col key={story._id} lg={24} xl={12} xxl={8}>
              <Story setSelectedId={setSelectedId} story={story} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

StoryList.propTypes = {
  setSelectedId: PropTypes.func.isRequired,
};
