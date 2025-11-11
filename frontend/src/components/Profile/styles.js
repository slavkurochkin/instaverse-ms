const styles = {
  center: {
    margin: 'auto',
    width: '60%',
    border: '1px solid rgb(59 66 49)',
    padding: '10px',
  },
  profileContainer: {
    position: 'relative',
  },
  spinOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    boxShadow: 'none', // Remove box-shadow
    backgroundColor: 'transparent', // Set background to transparent
  },
};

export default styles;
