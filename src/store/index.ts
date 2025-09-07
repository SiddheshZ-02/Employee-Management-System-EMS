import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import employeeSlice from "./slices/employeeSlice";
import departmentSlice from "./slices/departmentSlice";
import attendanceSlice from "./slices/attendanceSlice";
import leaveSlice from "./slices/leaveSlice";
import adminSlice from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    employees: employeeSlice,
    departments: departmentSlice,
    attendance: attendanceSlice,
    leave: leaveSlice,
    admin: adminSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
