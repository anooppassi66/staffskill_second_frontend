import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
    id: string | null
    name: string | null
    email: string | null
    token: string | null
    role: string | null
    first_name: string | null
    last_name: string | null
    dob: string | null
    gender: string | null
    nationality: string | null
    address: string | null
    phone_number: string | null
    location: string | null
    phone: string | null
    avatar_url: string | null
}

const initialState: UserState = {
    id: null,
    name: null,
    email: null,
    token: null,
    role: null,
    first_name: null,
    last_name: null,
    dob: null,
    gender: null,
    nationality: null,
    address: null,
    phone_number: null,
    location: null,
    phone: null,
    avatar_url: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Partial<UserState>>) => {
            state.id = action.payload.id ?? state.id
            state.name = action.payload.name ?? state.name
            state.email = action.payload.email ?? state.email
            state.token = action.payload.token ?? state.token
            state.role = action.payload.role ?? state.role
            state.first_name = action.payload.first_name ?? state.first_name
            state.last_name = action.payload.last_name ?? state.last_name
            state.dob = action.payload.dob ?? state.dob
            state.gender = action.payload.gender ?? state.gender
            state.nationality = action.payload.nationality ?? state.nationality
            state.address = action.payload.address ?? state.address
            state.phone_number = action.payload.phone_number ?? state.phone_number
            state.location = action.payload.location ?? state.location
            state.phone = action.payload.phone ?? state.phone
            state.avatar_url = action.payload.avatar_url ?? state.avatar_url
        },
        clearUser: (state) => {
            state.id = null
            state.name = null
            state.email = null
            state.token = null
            state.role = null
            state.first_name = null
            state.last_name = null
            state.dob = null
            state.gender = null
            state.nationality = null
            state.address = null
            state.phone_number = null
            state.location = null
            state.phone = null
            state.avatar_url = null
        },
    },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
