import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount: number;
  // budget: number;
  status: 'Active' | 'Inactive';
}

export interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialDepartments: Department[] = [
  // {
  //   id: '1',
  //   name: 'Engineering',
  //   description: 'Software development and technical operations',
  //   manager: 'John Doe',
  //   employeeCount: 15,
   
  //   status: 'Active',
  // },
  // {
  //   id: '2',
  //   name: 'Product',
  //   description: 'Product management and strategy',
  //   manager: 'Jane Smith',
  //   employeeCount: 8,
 
  //   status: 'Active',
  // },
  // {
  //   id: '3',
  //   name: 'Sales',
  //   description: 'Customer acquisition and relationship management',
  //   manager: 'Mike Johnson',
  //   employeeCount: 12,
   
  //   status: 'Active',
  // },
  // {
  //   id: '4',
  //   name: 'Marketing',
  //   description: 'Brand promotion and marketing campaigns',
  //   manager: 'Sarah Wilson',
  //   employeeCount: 6,

  //   status: 'Active',
  // },
  // {
  //   id: '5',
  //   name: 'HR',
  //   description: 'Human resources and talent management',
  //   manager: 'Lisa Brown',
  //   employeeCount: 4,
    
  //   status: 'Active',
  // },
];

const initialState: DepartmentState = {
  departments: initialDepartments,
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.departments.push(action.payload);
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex(dept => dept.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },
    deleteDepartment: (state, action: PayloadAction<string>) => {
      state.departments = state.departments.filter(dept => dept.id !== action.payload);
    },
  },
});

export const { setLoading, setError, setDepartments, addDepartment, updateDepartment, deleteDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;