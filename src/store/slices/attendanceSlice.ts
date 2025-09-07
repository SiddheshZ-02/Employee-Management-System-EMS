import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  workinghours: number;
  workingminutes?: number;
}
export interface Record {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  workinghours: number;
}


interface AttendanceState {
  records: AttendanceRecord[];
  todayRecord?: AttendanceRecord;
}

const initialState: AttendanceState = {
  records: [],
  todayRecord: undefined,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clockIn: (state, action: PayloadAction<{ record: AttendanceRecord }>) => {
      // Add the new record from API response
      state.records.push(action.payload.record);
      state.todayRecord = action.payload.record;
    },
    clockOut: (state, action: PayloadAction<{ record: AttendanceRecord }>) => {
      // Update todayRecord and records from API response
      state.todayRecord = action.payload.record;
      const recordIndex = state.records.findIndex(
        (r) => r.id === action.payload.record.id
      );
      if (recordIndex !== -1) {
        state.records[recordIndex] = action.payload.record;
      }
    },
    loadTodayRecord: (state, action: PayloadAction<{ employeeId: string }>) => {
      const today = new Date().toISOString().split("T")[0];
      const todayRecord = state.records.find(
        (record) =>
          record.employee_id === action.payload.employeeId &&
          record.date === today
      );
      state.todayRecord = todayRecord;
    },
  },
});

export const { clockIn, clockOut, loadTodayRecord } = attendanceSlice.actions;
export default attendanceSlice.reducer;
