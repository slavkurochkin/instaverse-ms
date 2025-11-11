import React, { useState, useEffect } from 'react';
import { EditOutlined, CheckOutlined, CameraOutlined } from '@ant-design/icons';
import {
  Avatar,
  Card,
  Input,
  message,
  Spin,
  Modal,
  Upload,
  Button,
} from 'antd';
import styles from './styles'; // Import styles
import { useDispatch } from 'react-redux';
import {
  getUserStories,
  getUserProfile,
  uploadProfileImage,
} from '../../actions/profile';
import StoryList from '../StoryList';
import StoryForm from '../StoryForm'; // Import StoryForm component
import { useLocation } from 'react-router-dom'; // Import useLocation

const { Meta } = Card;

// Helper function to get gender-based avatar placeholder
const getAvatarPlaceholder = (gender, userId = null) => {
  // Use userId or generate a consistent seed
  const baseSeed = userId ? String(userId) : 'default';

  if (!gender) {
    // Use avataaars style - diverse and gender-inclusive
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseSeed}`;
  }

  // Normalize gender value - handle different formats
  const genderStr = String(gender).toLowerCase().trim();

  // Debug log the gender value and detection result
  console.log('[Avatar Placeholder]', {
    originalGender: gender,
    normalizedGender: genderStr,
    userId: baseSeed,
    type: typeof gender,
  });

  // Use avataaars style which provides diverse avatars
  // Different seeds for different genders will naturally produce different-looking avatars
  // Check for male variations - be more explicit
  const isMale =
    genderStr === 'male' ||
    genderStr === 'm' ||
    genderStr === 'man' ||
    genderStr === 'masculine' ||
    genderStr.startsWith('male');

  // Check for female variations - be more explicit
  const isFemale =
    genderStr === 'female' ||
    genderStr === 'f' ||
    genderStr === 'woman' ||
    genderStr === 'feminine' ||
    genderStr.startsWith('female');

  console.log('[Avatar Placeholder] Gender detection:', {
    genderStr,
    isMale,
    isFemale,
    willUse: isMale ? 'MALE' : isFemale ? 'FEMALE' : 'DEFAULT',
  });

  if (isMale) {
    // Use "personas" style which has better gender representation
    // Combine baseSeed with a male identifier for consistent but masculine avatars
    const maleSeed = `male_${baseSeed}`;
    console.log('[Avatar Placeholder] Using MALE with seed:', maleSeed);
    return `https://api.dicebear.com/7.x/personas/svg?seed=${maleSeed}`;
  } else if (isFemale) {
    // Use "personas" style which has better gender representation
    // Combine baseSeed with a female identifier for consistent but feminine avatars
    const femaleSeed = `female_${baseSeed}`;
    console.log('[Avatar Placeholder] Using FEMALE with seed:', femaleSeed);
    return `https://api.dicebear.com/7.x/personas/svg?seed=${femaleSeed}`;
  }
  // Default fallback for other genders or unspecified
  else {
    console.log(
      '[Avatar Placeholder] Using DEFAULT (gender not recognized:',
      genderStr,
      ')',
    );
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseSeed}`;
  }
};

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('profile'));
  const location = useLocation(); // Get the location object
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId'); // Extract the userId query param if it exists
  // Support both old and new token structures
  const currentUser =
    user?.result?._id || user?.result?.id || user?._id || user?.id;
  const dispatch = useDispatch();
  const [id, setId] = useState(null); // Use userId if available, otherwise fallback to profile id
  const [userProfile, setUserProfile] = useState(null);
  // eslint-disable-next-line
  const [userStories, setUserStories] = useState(null);

  useEffect(() => {
    if (userId) {
      setId(userId);
    } else if (currentUser) {
      setId(currentUser);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        const profile = await dispatch(getUserProfile(id)); // Fetch user profile
        const stories = await dispatch(getUserStories(id)); // Fetch stories

        // Store the user profile in local state
        setUserProfile(profile);
        setUserStories(stories);

        // If viewing own profile, update avatar if no uploaded avatar exists
        if (!userId && profile && !profile.avatar && !user?.result?.avatar) {
          const placeholder = getAvatarPlaceholder(
            profile.gender || user?.result?.gender,
            profile._id || user?.result?._id,
          );
          setAvatar(placeholder);
        }
      };

      fetchUserData();
    }
  }, [
    id,
    dispatch,
    userId,
    user?.result?.gender,
    user?.result?._id,
    user?.result?.avatar,
  ]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [username, setUsername] = useState(user?.result?.username || '');
  const [bio, setBio] = useState(user?.result?.bio || '');
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [selectedId, setSelectedId] = useState(null); // Track selected story ID
  const [uploading, setUploading] = useState(false); // Track image upload state
  const [avatar, setAvatar] = useState(
    user?.result?.avatar ||
      getAvatarPlaceholder(user?.result?.gender, user?.result?._id),
  );

  useEffect(() => {
    document.title = 'Instaverse'; // Set document title on component mount
  }, []);

  // Update avatar placeholder when userProfile is loaded (especially for own profile)
  useEffect(() => {
    if (!userId && userProfile) {
      // If viewing own profile and no uploaded avatar exists, use gender-based placeholder
      const profileAvatar = userProfile.avatar;

      // Check if avatar is an uploaded image (starts with http://localhost or full domain)
      const hasUploadedAvatar =
        profileAvatar &&
        (profileAvatar.startsWith('http://') ||
          profileAvatar.startsWith('https://')) &&
        !profileAvatar.includes('dicebear.com') &&
        !profileAvatar.includes('api.dicebear.com');

      if (!hasUploadedAvatar) {
        // Always use the gender from userProfile (backend data) as primary source
        const gender = userProfile.gender || user?.result?.gender;
        const id = userProfile._id || user?.result?._id;

        // Debug logging
        console.log('=== Avatar Update Debug ===');
        console.log('userProfile:', userProfile);
        console.log('userProfile.gender:', userProfile.gender);
        console.log('user?.result?.gender:', user?.result?.gender);
        console.log('Using gender:', gender);
        console.log('Has uploaded avatar:', hasUploadedAvatar);
        console.log('========================');

        const placeholder = getAvatarPlaceholder(gender, id);
        // Force update the avatar even if it's already set (to correct wrong gender)
        setAvatar(placeholder);
      } else {
        // User has uploaded avatar, use it
        setAvatar(profileAvatar);
      }
    }
  }, [userProfile, userId, user?.result?.gender, user?.result?._id]);

  const handleEditNameClick = () => {
    setIsEditingName(true);
  };

  const handleEditBioClick = () => {
    setIsEditingBio(true);
  };

  const handleSaveNameClick = () => {
    setIsEditingName(false);
    const updatedUser = {
      ...user,
      result: { ...user.result, username: username },
    };
    localStorage.setItem('profile', JSON.stringify(updatedUser)); // Update localStorage
    message.success('Username changed successfully!');
    // Dispatch an action if you use redux to update user information on server
  };

  const handleSaveBioClick = () => {
    setLoading(true); // Show spinner

    setTimeout(() => {
      setLoading(false); // Hide spinner after 3 seconds

      setIsEditingBio(false);
      const updatedUser = { ...user, result: { ...user.result, bio: bio } };
      localStorage.setItem('profile', JSON.stringify(updatedUser)); // Update localStorage
      message.success('Bio changed successfully!');
      // Dispatch an action if you use redux to update user information on server
    }, 3000);
  };

  const handleEditStoryClick = (storyId) => {
    setSelectedId(storyId); // Set the selected story ID
    setIsModalVisible(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalVisible(false); // Close the modal
    setSelectedId(null); // Reset the selected story ID
  };

  const handleImageUpload = async (file) => {
    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;

        try {
          const response = await dispatch(uploadProfileImage(base64Image));

          if (response && response.avatar) {
            setAvatar(response.avatar);

            // Update localStorage with new avatar
            const updatedUser = {
              ...user,
              result: { ...user.result, avatar: response.avatar },
            };
            localStorage.setItem('profile', JSON.stringify(updatedUser));

            message.success('Profile image updated successfully!');
          }
        } catch (error) {
          message.error('Failed to upload profile image');
          console.error('Upload error:', error);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      message.error('Failed to process image');
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  return (
    <div style={styles.center} className={styles.profileContainer}>
      <style>{`.ant-spin-nested-loading { ${styles.spinOverlay} }`}</style>
      <Spin
        spinning={loading}
        tip="Updating..."
        size="large"
        className="ant-spin-nested-loading"
      >
        <Card style={{ width: '100%' }}>
          <Meta
            avatar={
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={
                    userId
                      ? userProfile?.avatar ||
                        getAvatarPlaceholder(
                          userProfile?.gender,
                          userProfile?._id || userId,
                        )
                      : avatar ||
                        getAvatarPlaceholder(
                          userProfile?.gender || user?.result?.gender,
                          userProfile?._id || user?.result?._id,
                        )
                  }
                  size={64}
                  style={{ backgroundColor: '#f0f0f0', borderRadius: '50%' }}
                />
                {!userId && (
                  <Upload
                    beforeUpload={handleImageUpload}
                    accept="image/*"
                    showUploadList={false}
                    disabled={uploading}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      loading={uploading}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        zIndex: 1,
                      }}
                    />
                  </Upload>
                )}
              </div>
            }
            title={
              isEditingName ? (
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onPressEnter={handleSaveNameClick} // Allow saving on Enter press
                />
              ) : (
                <div>
                  {userId ? userProfile?.username : username}{' '}
                  {!userId && !isEditingName && (
                    <EditOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleEditNameClick}
                    />
                  )}
                  {userId && isEditingName && (
                    <CheckOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleSaveNameClick}
                    />
                  )}
                </div>
              )
            }
            description={
              isEditingBio ? (
                <Input.TextArea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onPressEnter={handleSaveBioClick} // Allow saving on Enter press
                />
              ) : (
                <div>
                  {userId ? userProfile?.bio : bio}{' '}
                  {!userId && !isEditingBio && (
                    <EditOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleEditBioClick}
                    />
                  )}
                  {userId && isEditingBio && (
                    <CheckOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleSaveBioClick}
                    />
                  )}
                </div>
              )
            }
          />
        </Card>
      </Spin>

      <div style={{ paddingTop: '20px' }}>
        <StoryList
          setSelectedId={handleEditStoryClick} // Pass edit handler to StoryList
        />
      </div>

      <Modal
        title={null} // Customize the header title
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <StoryForm
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          page={'profile'}
          handleClose={handleModalClose}
        />
      </Modal>
    </div>
  );
}
