import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    workspaceName: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

 const signUp = async (
  email: string,
  password: string,
  fullName: string,
  workspaceName: string,
) => {
  // 1. Create the Supabase Auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error };
  }

  if (!data.user) {
    return {
      error: new Error("User was not created."),
    };
  }

  const userId = data.user.id;

  // 2. Create the user's profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      full_name: fullName,
    });

  if (profileError) {
    console.error("PROFILE ERROR:", profileError);
    return { error: profileError };
  }

  // 3. Create the workspace and get its ID
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: workspaceName,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (workspaceError) {
    console.error("WORKSPACE ERROR:", workspaceError);
    return { error: workspaceError };
  }

  // 4. Add the user as the workspace Owner
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: "owner",
      can_edit: true,
      can_delete: true,
      can_invite: true,
    });

  if (memberError) {
    console.error("MEMBERSHIP ERROR:", memberError);
    return { error: memberError };
  }

  return { error: null };
};
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
