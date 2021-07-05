import { createStore, combineReducers } from 'redux';
import resume from './reducers';

const reducers = combineReducers({ resume });

export default createStore(reducers);
