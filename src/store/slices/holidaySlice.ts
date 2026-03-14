import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  description?: string;
  officeLocation?: {
    _id: string;
    name: string;
  };
  companyId: string;
}

interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
}

const initialState: HolidayState = {
  holidays: [],
  loading: false,
  error: null,
};

const holidaySlice = createSlice({
  name: "holiday",
  initialState,
  reducers: {
    setHolidays: (state, action: PayloadAction<Holiday[]>) => {
      state.holidays = action.payload;
      state.loading = false;
      state.error = null;
    },
    addHoliday: (state, action: PayloadAction<Holiday>) => {
      state.holidays.push(action.payload);
      state.holidays.sort((a, b) => a.date.localeCompare(b.date));
    },
    updateHolidayInState: (state, action: PayloadAction<Holiday>) => {
      const index = state.holidays.findIndex((h) => h._id === action.payload._id);
      if (index !== -1) {
        state.holidays[index] = action.payload;
        state.holidays.sort((a, b) => a.date.localeCompare(b.date));
      }
    },
    removeHoliday: (state, action: PayloadAction<string>) => {
      state.holidays = state.holidays.filter((h) => h._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setHolidays,
  addHoliday,
  updateHolidayInState,
  removeHoliday,
  setLoading,
  setError,
} = holidaySlice.actions;

export default holidaySlice.reducer;
