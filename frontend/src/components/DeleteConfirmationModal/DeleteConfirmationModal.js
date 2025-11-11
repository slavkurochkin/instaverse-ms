import React from 'react';
import { Modal, Button } from 'antd';

const DeleteConfirmationModal = ({ open, onConfirm, onCancel, record }) => {
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
          onClick={() => onConfirm(record)}
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
