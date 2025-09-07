import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Admins {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  status: "Active" | "Inactive";
  role: "";
  password: "";
}

export interface AdminState {
  admins: Admins[];
  loading: boolean;
  error: string | null;
}

const initialAdmins: Admins[] = [

//   {
//     id: "1",
//     name: "John Doe",
//     email: "john.doe@company.com",
//     position: "Senior Developer",
//     department: "Engineering",
//     joinDate: "2023-01-15",
//     status: "Active",
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     email: "jane.smith@company.com",
//     position: "Product Manager",
//     department: "Product",
//     joinDate: "2023-03-20",
//     status: "Active",
//   },
//   {
//     id: "3",
//     name: "Mike Johnson",
//     email: "mike.johnson@company.com",
//     position: "Sales Representative",
//     department: "Sales",
//     joinDate: "2023-02-10",
//     status: "Active",
//   },
//   {
//     id: "4",
//     name: "Sarah Wilson",
//     email: "sarah.wilson@company.com",
//     position: "Marketing Specialist",
//     department: "Marketing",
//     joinDate: "2023-04-05",
//     status: "Inactive",
//   },
];

const initialState: AdminState = {
  admins: initialAdmins,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAdmins: (state, action: PayloadAction<Admins[]>) => {
      state.admins = action.payload;
    },
    addAdmin: (state, action: PayloadAction<Admins>) => {
      state.admins.push(action.payload);
    },
    updateAdmin: (state, action: PayloadAction<Admins>) => {
      const index = state.admins.findIndex(
        (adm) => adm.id === action.payload.id
      );
      if (index !== -1) {
        state.admins[index] = action.payload;
      }
    },
    deleteAdmin: (state, action: PayloadAction<string>) => {
      state.admins = state.admins.filter(
        (adm) => adm.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  setAdmins,
} = adminSlice.actions;
export default adminSlice.reducer;
