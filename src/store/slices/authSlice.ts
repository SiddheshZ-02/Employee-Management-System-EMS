import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// import { useDispatch } from 'react-redux';

export type UserRole = "Admin" | "Employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

// Demo accounts
const demoAccounts = [
  {
    id: "1",
    email: "admin@company.com",
    password: "admin123",
    name: "Admin",
    role: "Admin" as UserRole,
    department: "HR",
  },
  {
    id: "2",
    email: "employee@company.com",
    password: "employee123",
    name: "Siddhesh",
    role: "Employee" as UserRole,
    department: "Sales",
  },
];

// const dispatch =useDispatch()
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        state.token = token;
        state.user = JSON.parse(userStr);
        state.isAuthenticated = true;
      }
    },
    signup: (
      state,
      action: PayloadAction<{
        email: string;
        password: string;
        name: string;
        role: UserRole;
        department: string;
      }>
    ) => {
      const newUser: User = {
        id: Date.now().toString(),
        email: action.payload.email,
        name: action.payload.name,
        role: action.payload.role,
        department: action.payload.department,
      };

      const token = `token_${Date.now()}`;

      state.user = newUser;
      state.token = token;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

// Async login action
export const loginAsync =
  (email: string, password: string) => (dispatch: any) => {
    dispatch(loginStart());

    // Simulate API call
    setTimeout(() => {
      const account = demoAccounts.find(
        (acc) => acc.email === email && acc.password === password
      );

      if (account) {
        const { password: _, ...user } = account;
        const token = `token_${Date.now()}`;
        dispatch(loginSuccess({ user, token }));
      } else {
        dispatch(loginFailure());
      }
    }, 1000);
  };

// export const loginAsync = (email: string, password: string) => (dispatch: any) => {
//   dispatch(loginStart());
//   // Fetch both employees and admins from db.json API
//   Promise.all([
//     fetch('https://ems-api-data.onrender.com/employees').then(res => res.json()),
//     fetch('https://ems-api-data.onrender.com/admins').then(res => res.json())
//   ])
//     .then(([employees, admins]) => {
//       const allUsers = [...employees, ...admins];
//       const account = allUsers.find((acc: any) => acc.email === email && acc.password === password);
//       if (account) {
//         const { password: _, ...user } = account;
//         const token = `token_${Date.now()}`;
//         dispatch(loginSuccess({ user, token }));
//       } else {
//         dispatch(loginFailure());
//       }
//     })
//     .catch(() => {
//       dispatch(loginFailure());
//     });
// };

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  loadUserFromStorage,
  signup,
  updateProfile,
} = authSlice.actions;
export default authSlice.reducer;
