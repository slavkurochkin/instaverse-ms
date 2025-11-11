import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Tooltip,
  Typography,
  Image,
  Modal,
  Button,
  message,
  Tag,
  Input,
  List,
} from 'antd';
import {
  EditOutlined,
  DeleteTwoTone,
  HeartTwoTone,
  MessageTwoTone,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import styles from './styles';
import {
  deleteStory,
  likeStory,
  commentOnStory,
  deleteComment,
} from '../../actions/stories'; // Import action for commenting
import { FETCH_PROFILE } from '../../constants/actionTypes';
import PropTypes from 'prop-types';

const { Meta } = Card;
const { Paragraph, Text } = Typography;
const { TextArea } = Input;

const tagColors = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
];

function Story({ story, setSelectedId }) {
  const showMessage = () => {
    message.success('Success! Your post was deleted.');
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [comment, setComment] = useState(''); // State to track comment input
  const [comments, setComments] = useState(story?.comments || []); // Initialize with story comments to prevent layout shift
  const [expand, setExpand] = useState(true); // Declare expand state
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're currently viewing this user's profile
  const queryParams = new URLSearchParams(location.search);
  const currentProfileUserId = queryParams.get('userId');
  const isOnUserProfile =
    location.pathname === '/profile' &&
    (currentProfileUserId === String(story.userId) ||
      (!currentProfileUserId &&
        story.userId ===
          JSON.parse(localStorage.getItem('profile'))?.result?._id));
  // Effect to update comments state when the story updates
  useEffect(() => {
    if (story && story.comments) {
      setComments(story.comments); // Update comments when story prop changes
    } else if (story && !story.comments) {
      setComments([]); // Ensure empty array if no comments
    }
  }, [story]); // Run the effect whenever story changes

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    dispatch(deleteStory(story._id));
    setIsModalOpen(false);
    showMessage();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem('profile'));

  const navigateToProfile = useCallback(
    (userId) => {
      dispatch({ type: FETCH_PROFILE });
      navigate(`/profile/?userId=${userId}`);
    },
    [dispatch, navigate],
  );

  if (!story || !story._id) {
    return null; // or handle the case where story is undefined
  }

  const handleCommentSubmit = async () => {
    if (!story || !story._id) {
      message.error('Story ID is missing.');
      return;
    }

    if (comment.trim() && user?.result?.username) {
      const newComment = {
        text: comment,
        username: user?.result?.username,
        date: new Date().toISOString(),
      };

      try {
        // Ensure the dispatch returns the updated story
        const updatedStory = dispatch(commentOnStory(story._id, newComment));

        // Update local state with comments from the updated story
        setComments(updatedStory.comments); // Assuming `comments` is part of the story returned

        // Reset the input field and close modal
        setComment('');
        setIsCommentModalOpen(false);
        message.success('Comment added successfully!');
      } catch (error) {
        message.error('Failed to add comment. Please try again.');
      }
    } else {
      message.error('Please enter a comment and ensure you are logged in.');
    }
  };

  const handleCommentDelete = (commentId) => {
    // Optimistically update the UI by removing the comment from the local state
    const updatedComments = comments.filter(
      (comment) => comment.commentId !== commentId,
    );
    setComments(updatedComments);
    // Then, dispatch the action to delete the comment from the backend
    dispatch(deleteComment(story._id, commentId))
      .then(() => {
        message.success('Comment deleted successfully!');
      })
      .catch(() => {
        // If the API call fails, revert the local state by adding the comment back
        setComments([
          ...updatedComments,
          comments.find((comment) => comment.commentId === commentId),
        ]);
        message.error('Failed to delete comment. Please try again.');
      });
  };

  const cardActions = [
    <div key="like" style={styles.actions}>
      <Tooltip
        placement="top"
        title="Like"
        color="magenta"
        onClick={() => {
          dispatch(likeStory(story._id));
        }}
      >
        <HeartTwoTone twoToneColor="magenta" />
        &nbsp; {(story.likes || []).length} &nbsp;
      </Tooltip>
    </div>,
    <div key="comments">
      <Tooltip
        placement="top"
        color="blue"
        title="Comments"
        onClick={() => setIsCommentModalOpen(true)}
      >
        <MessageTwoTone />
      </Tooltip>
      <Modal
        title="Add Comment"
        open={isCommentModalOpen}
        onOk={handleCommentSubmit}
        onCancel={() => setIsCommentModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCommentModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCommentSubmit}>
            Submit
          </Button>,
        ]}
      >
        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your comment here..."
        />
      </Modal>
    </div>,
    <Tooltip key="edit" placement="top" color="green" title="Edit">
      <EditOutlined onClick={() => setSelectedId(story._id)} />
    </Tooltip>,
    <Tooltip key="delete" placement="top" title="Delete" color="red">
      <DeleteTwoTone twoToneColor="red" onClick={showModal} />
      <Modal
        title="Delete Post"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleOk}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this post?</p>
      </Modal>
    </Tooltip>,
  ];

  return (
    <Card
      style={styles.card}
      cover={
        <Image
          src={story.image}
          width="100%"
          preview={true}
          style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
          placeholder={
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          }
          loading="lazy"
        />
      }
      actions={
        user?.result?._id === story?.userId
          ? cardActions
          : user?.result
            ? cardActions.slice(0, 2)
            : null
      }
    >
      <Meta
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{story.username}</span>
            {!isOnUserProfile && story.userId && (
              <Button
                type="link"
                icon={<UserOutlined />}
                onClick={() => navigateToProfile(story.userId)}
                style={{ marginLeft: 8 }}
              >
                View profile
              </Button>
            )}
          </div>
        }
      />

      <Paragraph
        style={{ margin: 0 }}
        ellipsis={{
          rows: 2,
          expandable: true,
          symbol: 'more',
          onExpand: () => setExpand(true),
          onEllipsis: () => setExpand(false),
        }}
        // Add key to force re-render when caption changes to prevent ResizeObserver issues
        key={`caption-${story._id}-${story.caption?.length || 0}`}
      >
        {story.caption}
      </Paragraph>
      <div>
        {expand &&
          story?.tags?.map((tag, index) => (
            <Tag color={tagColors[index % tagColors.length]} key={index}>
              {tag.toUpperCase()}
            </Tag>
          ))}
      </div>
      <br />
      <Text type="secondary">
        {story.category}, image taken on the {story.device}
      </Text>
      <br />
      <Text type="secondary">
        {Array.isArray(story.social)
          ? `Find it on ${story.social.join(', ')}`
          : `Find it on ${story.social}`}
      </Text>
      <br />
      <Text type="secondary">{moment(story.postDate).fromNow()}</Text>

      {/* Render Comments Section */}
      <div style={{ marginTop: '16px' }}>
        <Typography.Title level={5}>Comments</Typography.Title>

        <List
          dataSource={comments}
          locale={{ emptyText: '' }}
          renderItem={(comment, index) => (
            <List.Item key={index}>
              <List.Item.Meta
                title={comment.username || 'Unknown User'}
                description={comment.text || 'No comment text'}
              />
              <Text type="secondary">
                {comment.commentDate
                  ? moment(comment.commentDate).fromNow()
                  : 'No date available'}
              </Text>
              {(story.userId === user?.result?._id ||
                comment.username === user?.result?.username) && (
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={() => handleCommentDelete(comment.commentId)}
                />
              )}
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
}

Story.propTypes = {
  story: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    caption: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    device: PropTypes.string,
    social: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    postDate: PropTypes.string.isRequired,
    likes: PropTypes.arrayOf(PropTypes.string),
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        commentId: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        commentDate: PropTypes.string,
      }),
    ),
  }).isRequired,
  setSelectedId: PropTypes.func.isRequired,
};

export default Story;
