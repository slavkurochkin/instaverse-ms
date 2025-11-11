const tagsReducer = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_ALL_TAGS':
      return action.payload;
    default:
      return state;
  }
};

export default tagsReducer;
