"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, UserPlus, Settings } from "lucide-react";
import { use, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

function Profile() {
  const [user, setUser] = useState<User>();

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: userResponse, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        return "error: Not authenticated";
      }

      const user = userResponse?.user;
      if (!user) {
        console.error("User not found");
        return "error: Not authenticated";
      }

      setUser(user);
    }

    fetchUser();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
        <Card className="max-w-md mx-auto bg-slate-800 border-slate-700">
          <CardHeader className="relative pb-0">
            <div className="absolute top-4 right-4 space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-slate-700">
                <AvatarFallback>
                  {user?.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-4 text-2xl font-bold">{user?.email}</h1>
              <p className="text-slate-400">{user?.email}</p>
            </div>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </>
  );
}

export default Profile;
