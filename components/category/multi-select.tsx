import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Category {
  id: number;
  name: string;
  description?: string | null;
}

interface MultiSelectCategoryProps {
  allCategories: Category[];
  selectedCategoryIds: number[];
  onSelectionChange: (ids: number[]) => void;
  label?: string;
}

export function MultiSelectCategory({
  allCategories,
  selectedCategoryIds = [],
  onSelectionChange,
  label = "Pilih Kategori",
}: MultiSelectCategoryProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedCategories = allCategories.filter((cat) =>
    selectedCategoryIds.includes(cat.id),
  );

  const filteredCategories = allCategories.filter(
    (cat) =>
      !selectedCategoryIds.includes(cat.id) &&
      cat.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleSelect = (id: number) => {
    if (!selectedCategoryIds.includes(id)) {
      onSelectionChange([...selectedCategoryIds, id]);
    }
    setInputValue("");
  };

  const handleRemove = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSelectionChange(selectedCategoryIds.filter((catId) => catId !== id));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedCategories.length === 0 ? (
                <span className="text-muted-foreground">Pilih kategori...</span>
              ) : (
                selectedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm flex items-center gap-1"
                  >
                    <span className="truncate">{category.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(category.id, e)}
                      className="ml-1 hover:text-primary-foreground/80 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Cari kategori..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandGroup>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        handleSelect(category.id);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedCategoryIds.includes(category.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {category.name}
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled>
                    Tidak ada kategori ditemukan
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
