"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { baseUrl } from "../constants";
import { getAuthHeadersWithoutContentType } from "../utils/auth";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  contact_number?: string;
  birthday?: string;
  bio?: string;
  profile_image?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}/users/me/`, {
        headers: getAuthHeadersWithoutContentType(),
      });

      if (!response.ok) {
        // If unauthorized, clear token and user
        if (response.status === 401) {
          localStorage.removeItem("access_token");
        }
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, fetchUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
