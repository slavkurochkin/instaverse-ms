import { combineReducers } from 'redux';

import stories from './stories';
import tags from './tags';
import authentication from './authentication';
import profile from './profile';

export default combineReducers({
  stories,
  tags,
  authentication,
  profile,
});
