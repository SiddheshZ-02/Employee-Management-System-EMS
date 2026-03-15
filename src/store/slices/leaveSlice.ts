import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  payType: "paid" | "unpaid";
  status: string;
  submittedAt: string;
  approvedByName?: string;
  approvedByEmail?: string;
}

interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveType {
  id?: string;
  _id?: string;
  name: string;
  yearlyCount: number;
  isActive: boolean;
}

interface LeaveBalances {
  vacation: LeaveBalance;
  sick: LeaveBalance;
  personal: LeaveBalance;
  maternity: LeaveBalance;
}

export interface EmployeeLeaveBalance {
  id?: string;
  _id?: string;
  userId?: string;
  employeeId?: string;
  leaveTypeId: any;
  year: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  status: 'active' | 'expired';
}

interface LeaveState {
  requests: LeaveRequest[];
  balances: LeaveBalances;
  leaveTypes: LeaveType[];
  employeeLeaveBalances: EmployeeLeaveBalance[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  balances: {
    vacation: { total: 20, used: 2, remaining: 18 },
    sick: { total: 10, used: 1, remaining: 9 },
    personal: { total: 5, used: 0, remaining: 5 },
    maternity: { total: 12, used: 0, remaining: 12 },
  },
  leaveTypes: [],
  employeeLeaveBalances: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLeaveTypes: (state, action: PayloadAction<LeaveType[]>) => {
      state.leaveTypes = action.payload;
    },
    setEmployeeLeaveBalances: (state, action: PayloadAction<EmployeeLeaveBalance[]>) => {
      state.employeeLeaveBalances = action.payload;
    },
    addLeaveType: (state, action: PayloadAction<LeaveType>) => {
      state.leaveTypes.push(action.payload);
    },
    updateLeaveType: (state, action: PayloadAction<LeaveType>) => {
      const index = state.leaveTypes.findIndex(lt => (lt._id || lt.id) === (action.payload._id || action.payload.id));
      if (index !== -1) {
        state.leaveTypes[index] = action.payload;
      }
    },
    removeLeaveType: (state, action: PayloadAction<string>) => {
      state.leaveTypes = state.leaveTypes.filter(lt => (lt._id || lt.id) !== action.payload);
    },
    submitLeaveRequest: (state, action: PayloadAction<Omit<LeaveRequest, 'id'>>) => {
      const newRequest: LeaveRequest = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.requests.push(newRequest);
    },
    cancelLeaveRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter(request => request.id !== action.payload);
    },
    updateLeaveRequestStatus: (state, action: PayloadAction<{ id: string; status: LeaveRequest['status'] }>) => {
      const request = state.requests.find(req => req.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
  },
});

export const {
  submitLeaveRequest,
  cancelLeaveRequest,
  updateLeaveRequestStatus,
  setLoading,
  setError,
  setLeaveTypes,
  setEmployeeLeaveBalances,
  addLeaveType,
  updateLeaveType,
  removeLeaveType,
} = leaveSlice.actions;
export default leaveSlice.reducer;
