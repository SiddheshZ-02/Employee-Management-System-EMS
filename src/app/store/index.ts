import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/authSlice";
import employeeReducer from "@/features/employees/store/employeeSlice";
import departmentReducer from "@/features/departments/store/departmentSlice";
import attendanceReducer from "@/features/attendance/store/attendanceSlice";
import leaveReducer from "@/features/leave/store/leaveSlice";
import holidayReducer from "@/features/holidays/store/holidaySlice";
import adminReducer from "@/features/settings/store/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    departments: departmentReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    admin: adminReducer,
    holiday: holidayReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
