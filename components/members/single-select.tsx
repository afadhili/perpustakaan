"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronDown } from "lucide-react";

interface Member {
  id: number;
  name: string;
}

interface SingleSelectMemberProps {
  members: Member[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

export function SingleSelectMember({
  members,
  value,
  onChange,
  placeholder = "Pilih anggota...",
}: SingleSelectMemberProps) {
  const [open, setOpen] = React.useState(false);

  const selectedMember = members.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedMember ? selectedMember.name : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari anggota..." />
          <CommandEmpty>Anggota tidak ditemukan.</CommandEmpty>
          <CommandGroup>
            {members.map((member) => (
              <CommandItem
                key={member.id}
                value={member.name}
                onSelect={() => {
                  onChange(member.id === value ? null : member.id);
                  setOpen(false);
                }}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === member.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {member.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
