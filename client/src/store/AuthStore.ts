// store/authStore.ts
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

export type AuthError = {
  message: string;
  field?: string;
  fieldErrors?: Record<string, string[]>;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (data: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; route?: string; error?: AuthError }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; route?: string; error?: AuthError }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (payload): Promise<{ success: boolean; route?: string; error?: AuthError }> => {
        try {
          set({ loading: true });

          const { data } = await api.post("/auth/login", payload);

          // Check for API error response
          if (data.error) {
            set({ loading: false });
            toast.error(data.error.message || "Login failed");
            return { success: false, error: data.error };
          }

          const { user, token } = data.data || {};

          if (!user) {
            set({ loading: false });
            const error = { message: "Invalid login response from server" };
            toast.error(error.message);
            return { success: false, error };
          }

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });

          toast.success("Login successful");
          return { success: true, route: "/products" };
        } catch (error: any) {
          set({ loading: false });

          // Handle validation error format
          if (error.response?.data?.errors?.fieldErrors) {
            const fieldErrors = error.response.data.errors.fieldErrors;
            const firstErrorKey = Object.keys(fieldErrors)[0];
            const firstErrorMessage = fieldErrors[firstErrorKey]?.[0] || "Validation failed";

            toast.error(firstErrorMessage);

            return {
              success: false,
              error: {
                message: error.response.data.message || "Validation failed",
                fieldErrors: fieldErrors,
                field: firstErrorKey
              }
            };
          }

          const errorMessage = error.response?.data?.message || "Network error. Please try again.";
          const errorField = error.response?.data?.field;

          toast.error(errorMessage);

          return {
            success: false,
            error: { message: errorMessage, field: errorField }
          };
        }
      },

      register: async (payload): Promise<{ success: boolean; route?: string; error?: AuthError }> => {
        try {
          set({ loading: true });

          const { data } = await api.post("/auth/register", payload);

          // Check for API error response
          if (data.error) {
            set({ loading: false });
            toast.error(data.error.message || "Registration failed");
            return { success: false, error: data.error };
          }



          if(!data.success) {
            set({ loading: false });
            const error = { message: data.message || "Registration failed" };
            toast.error(error.message);
            return { success: false, error };
          }
          set({ loading: false });
          toast.success("Registration successful!");
          return { success: true, route: "/login" };
        } catch (error: any) {
          set({ loading: false });

          // Handle validation error format
          if (error.response?.data?.errors?.fieldErrors) {
            const fieldErrors = error.response.data.errors.fieldErrors;
            const firstErrorKey = Object.keys(fieldErrors)[0];
            const firstErrorMessage = fieldErrors[firstErrorKey]?.[0] || "Validation failed";

            toast.error(firstErrorMessage);

            return {
              success: false,
              error: {
                message: error.response.data.message || "Validation failed",
                fieldErrors: fieldErrors,
                field: firstErrorKey
              }
            };
          }

          const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
          const errorField = error.response?.data?.field;

          toast.error(errorMessage);

          return {
            success: false,
            error: { message: errorMessage, field: errorField }
          };
        }finally{
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
          toast.success("Logged out successfully");
        } catch (err: any) {
          console.error("Logout API error:", err);
        } finally {
          try {
            localStorage.removeItem("auth-storage");
            sessionStorage.removeItem("auth-storage");
          } catch (err) {
            console.error("Failed to clear storage:", err);
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        try {
          localStorage.removeItem("auth-storage");
          sessionStorage.removeItem("auth-storage");
        } catch (err) {
          console.error("Failed to clear storage:", err);
        }
        set(initialState);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);