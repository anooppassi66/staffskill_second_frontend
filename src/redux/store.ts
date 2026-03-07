import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // uses localStorage for web
import userReducer from './slices/userSlice'

// Combine all reducers
const rootReducer = combineReducers({
    user: userReducer,
})

// Persist config
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user'],
}

// Wrap reducer with persist
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // required for redux-persist
        }),
})

// Persistor
export const persistor = persistStore(store)

// Type exports
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
