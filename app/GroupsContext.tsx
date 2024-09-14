"use client"; // This ensures it's a Client Component

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client"; // Adjust path if needed

const supabase = createClient();

interface GroupProps {
  id: string;
  name: string;
  members: number;
  amount: number;
}

interface GroupsContextType {
  groups: GroupProps[];
  isLoading: boolean;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProviderClient: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [groups, setGroups] = useState<GroupProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserGroups() {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error(userError || "No user found");
        setIsLoading(false);
        return;
      }

      const { data: userGroupIds, error: fetchError } = await supabase
        .from("group_memberships")
        .select("*")
        .eq("user_id", user.id);

      if (fetchError || !userGroupIds) {
        console.error(fetchError || "No group memberships found");
        setIsLoading(false);
        return;
      }

      const groupPromises = userGroupIds.map(async (membership) => {
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .eq("id", membership.group_id)
          .single();

        if (groupError) {
          console.error("Error fetching group:", groupError);
          return null;
        }

        return group;
      });

      const userGroups = (await Promise.all(groupPromises)).filter(
        Boolean
      ) as GroupProps[];
      setGroups(userGroups);
      setIsLoading(false);
    }

    fetchUserGroups();
  }, []);

  return (
    <GroupsContext.Provider value={{ groups, isLoading }}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error("useGroups must be used within a GroupsProviderClient");
  }
  return context;
};
