import { createSlice } from '@reduxjs/toolkit';

const initialState = {

    isCountry: true,
};

const uiStates = createSlice({
    name: 'uiStates',
    initialState,
    reducers: {
        setIsCountry: (state, action) => {
            state.isCountry = action.payload;
        },

    },
});

export default uiStates;

export const {

    setIsCountry,
} = uiStates.actions;
