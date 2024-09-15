"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

type ComboboxProps = {
  memberIds: string[];
};

type Member = {
  memberId: string;
  email: string;
};

export function Combobox({ memberIds }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [members, setMembers] = React.useState<Member[]>([]);

  const supabase = createClient();

  // https://undzepswvqfhbzqhnvay.supabase.co

  async function getUserById(userId: string) {
    const apiUrl = `https://your-supabase-url.supabase.co/auth/v1/admin/users/${userId}`;
    const apiKey = "your-service-role-key"; // Replace with your service role key

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error fetching user by UUID:", await response.text());
      return null;
    }

    const data = await response.json();
    return data;
  }

  // Fetch emails for all member IDs and update state
  React.useEffect(() => {
    async function fetchMemberEmails() {
      const memberPromises = memberIds.map(async (userId) => {
        const email = await getUserById(userId);
        return email ? { memberId: userId, email } : null;
      });

      const memberData = await Promise.all(memberPromises);
      setMembers(memberData.filter((member) => member !== null) as Member[]);
    }

    fetchMemberEmails();
  }, [memberIds]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? members.find((member) => member.email === value)?.email
            : "Search member..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {members.map((member) => (
                <CommandItem
                  key={member.memberId}
                  value={member.email}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === member.email ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {member.email}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
