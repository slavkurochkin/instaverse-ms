import React from 'react';
import { Modal, Button } from 'antd';

const DeleteConfirmationModal = ({ open, onConfirm, onCancel, record }) => {
  if (!record) {
    return null; // Handle the case where record is null or undefined
  }

  return (
    <Modal
      open={open}
      title="Confirm Delete"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={() => onConfirm(record.key)}
        >
          Delete
        </Button>,
      ]}
    >
      <p>Are you sure you want to delete {record.name}?</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
