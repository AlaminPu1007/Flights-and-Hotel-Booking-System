// /**
//  * @author { Alamin }
//   description :- configure store
//   created_at:- 21/12/2023 11:59:55
//   */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useSelector as useReduxSelector, useDispatch as useReduxDispatch } from 'react-redux';
import storage from './customStorage';
// bring your slice
import counterSlice from './features/counterSlice';
import persistReducer from 'redux-persist/es/persistReducer';

// combine reducers
const rootReducer = combineReducers({
    counterSlice,
});

// persist config
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // There is an issue in the source code of redux-persist (default setTimeout does not cleaning)
    timeout: null,
    /* if you do not want to persist this part of the state */
    blacklist: [],
};

// persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    // devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddlewares) => getDefaultMiddlewares({ serializableCheck: false }),
});

export const useDispatch = () => useReduxDispatch();
export const useSelector = useReduxSelector;
