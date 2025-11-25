import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  workinghours: number;
  workingminutes?: number;
  synced?: boolean; // ✅ indicates if record uploaded to backend
}

interface AttendanceState {
  records: AttendanceRecord[];
  todayRecord?: AttendanceRecord;
}

const LOCAL_KEY_TODAY = "today_record";
const LOCAL_KEY_OFFLINE = "attendance_offline_records";

/* 🔹 Helper: Save & Load LocalStorage safely */
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("LocalStorage write failed:", err);
  }
};

const loadFromLocalStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  } catch (err) {
    console.warn("LocalStorage read failed:", err);
    return undefined;
  }
};

/* 🔹 Initialize from localStorage */
const initialToday = loadFromLocalStorage(LOCAL_KEY_TODAY);
const initialOffline = loadFromLocalStorage(LOCAL_KEY_OFFLINE) || [];

const initialState: AttendanceState = {
  records: initialOffline,
  todayRecord: initialToday,
};

/* 🔹 Slice */
const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clockIn: (state, action: PayloadAction<{ record: AttendanceRecord }>) => {
      const record = action.payload.record;
      state.todayRecord = record;
      state.records.push(record);
      saveToLocalStorage(LOCAL_KEY_TODAY, record);
    },

    clockOut: (state, action: PayloadAction<{ record: AttendanceRecord }>) => {
      const updated = action.payload.record;
      state.todayRecord = updated;
      const index = state.records.findIndex((r) => r.id === updated.id);
      if (index !== -1) state.records[index] = updated;
      else state.records.push(updated);
      saveToLocalStorage(LOCAL_KEY_TODAY, updated);
    },

     resetTodayRecord: (state) => {
      state.todayRecord = undefined;
    },

    loadTodayRecord: (state, action: PayloadAction<{ employeeId: string }>) => {
      const today = new Date().toISOString().split("T")[0];
      const localToday = loadFromLocalStorage(LOCAL_KEY_TODAY);
      if (localToday && localToday.employee_id === action.payload.employeeId) {
        if (localToday.date === today) {
          state.todayRecord = localToday;
        } else {
          state.todayRecord = undefined; // clear if from previous day
          localStorage.removeItem(LOCAL_KEY_TODAY);
        }
      }
    },

    clearTodayRecord: (state) => {
      state.todayRecord = undefined;
      localStorage.removeItem(LOCAL_KEY_TODAY);
    },

    addOfflineRecord: (_state, action: PayloadAction<AttendanceRecord>) => {
      const offlineRecords: AttendanceRecord[] =
        loadFromLocalStorage(LOCAL_KEY_OFFLINE) || [];
      offlineRecords.push(action.payload);
      saveToLocalStorage(LOCAL_KEY_OFFLINE, offlineRecords);
    },

    removeSyncedOfflineRecord: (
      _state,
      action: PayloadAction<{ id: string }>
    ) => {
      const offlineRecords: AttendanceRecord[] =
        loadFromLocalStorage(LOCAL_KEY_OFFLINE) || [];
      const remaining = offlineRecords.filter((r) => r.id !== action.payload.id);
      saveToLocalStorage(LOCAL_KEY_OFFLINE, remaining);
    },

    syncAllOfflineRecords: (state) => {
      const offlineRecords: AttendanceRecord[] =
        loadFromLocalStorage(LOCAL_KEY_OFFLINE) || [];
      if (offlineRecords.length > 0) {
        state.records.push(...offlineRecords);
      }
    },
  },
});

export const {
  clockIn,
  clockOut,
  loadTodayRecord,
   resetTodayRecord,
  clearTodayRecord,
  addOfflineRecord,
  removeSyncedOfflineRecord,
  syncAllOfflineRecords,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
