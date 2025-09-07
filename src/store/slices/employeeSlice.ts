import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

export interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}


const initialEmployees: Employee[] = [
  // {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john.doe@company.com",
  //   position: "Senior Developer",
  //   department: "Engineering",
  //   joinDate: "2023-01-15",
  //   status: "Active",
  // },
  // {
  //   id: "2",
  //   name: "Jane Smith",
  //   email: "jane.smith@company.com",
  //   position: "Product Manager",
  //   department: "Product",
  //   joinDate: "2023-03-20",
  //   status: "Active",
  // },
  // {
  //   id: "3",
  //   name: "Mike Johnson",
  //   email: "mike.johnson@company.com",
  //   position: "Sales Representative",
  //   department: "Sales",
  //   joinDate: "2023-02-10",
  //   status: "Active",
  // },
  // {
  //   id: "4",
  //   name: "Sarah Wilson",
  //   email: "sarah.wilson@company.com",
  //   position: "Marketing Specialist",
  //   department: "Marketing",
  //   joinDate: "2023-04-05",
  //   status: "Inactive",
  // },
];

const initialState: EmployeeState = {
  employees: initialEmployees,
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(
        (emp) => emp.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(
        (emp) => emp.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setEmployees,
} = employeeSlice.actions;
export default employeeSlice.reducer;
