"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();

type group = {
  id?: string;
  name: string;
  created_by: string;
};

const createGroup = async (group: group) => {
  // Insert the new group into the 'groups' table in Supabase
  let groupuuid = uuidv4();
  group.id = groupuuid;

  console.log(group);
  const { data: insertData, error: insertError } = await supabase
    .from("groups")
    .insert([group]);

  if (insertError) {
    console.error("Error creating group:", insertError);
  }

  // Retrieve the user from Supabase auth
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

  const userId = user.id; // Access the user ID

  const { data, error } = await supabase
    .from("group_memberships")
    .insert({ user_id: userId, group_id: groupuuid, role: "admin" });

  if (error) {
    console.error("Error creating group:", error.message);
    return null;
  }

  toast({
    title: "Group Created!",
    description: `Group name: ${group.name}`, // Showing just the group name
  });
  return data;
};

const FormSchema = z.object({
  groupname: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  }),
});

export function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      groupname: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    const newGroup: group = {
      name: data.groupname,
      created_by: user.id,
    };

    createGroup(newGroup);

    // Log the data for debugging
    console.log("Submitted data:", data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="groupname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Beach Trip '24" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-white dark:bg-blue-600 dark:text-white shadow-sm rounded-full"
        >
          Create
        </Button>
      </form>
    </Form>
  );
}
