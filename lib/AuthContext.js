"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Final admin check
        if (user.email === "admin@indicabs.net") {
          setIsAdmin(true);
        } else {
          const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
          const adminSnapshot = await getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
