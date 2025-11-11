import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import StoryList from '../StoryList';
import StoryForm from '../StoryForm';
import ErrorBoundary from '../ErrorBoundary';
// import Tags from "../Tags";
// import StorySearch from "../StorySearch";
import { Layout } from 'antd';
import styles from './styles';
import { getStories, fetchAllTags } from '../../actions/stories';

const { Sider, Content } = Layout;

const Home = () => {
  const [selectedId, setSelectedId] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = 'Instaverse';
    dispatch(getStories());
    dispatch(fetchAllTags());
  }, [dispatch]);

  /** 
    if (isTagged) {
        dispatch(fetchStoriesByTag('test'));
    } else {
        dispatch(getStories());
    }
*/

  return (
    <ErrorBoundary>
      <Layout>
        <Sider style={styles.sider} width={400}>
          <ErrorBoundary>
            <StoryForm
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              handleClose={() => {}}
            />
          </ErrorBoundary>
        </Sider>
        <Content style={styles.content}>
          <ErrorBoundary>
            <StoryList setSelectedId={setSelectedId} />
          </ErrorBoundary>
        </Content>
      </Layout>
    </ErrorBoundary>
  );
};

export default Home;
