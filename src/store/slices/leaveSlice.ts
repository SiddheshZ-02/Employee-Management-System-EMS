import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveBalances {
  vacation: LeaveBalance;
  sick: LeaveBalance;
  personal: LeaveBalance;
  maternity: LeaveBalance;
  // paternity: LeaveBalance;
}

interface LeaveState {
  requests: LeaveRequest[];
  balances: LeaveBalances;
}

const initialState: LeaveState = {
  requests: [],
  balances: {
    vacation: { total: 20, used: 2, remaining: 18 },
    sick: { total: 10, used: 1, remaining: 9 },
    personal: { total: 5, used: 0, remaining: 5 },
    maternity: { total: 12, used: 0, remaining: 12 },
   
  },
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
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

export const { submitLeaveRequest, cancelLeaveRequest, updateLeaveRequestStatus } = leaveSlice.actions;
export default leaveSlice.reducer;