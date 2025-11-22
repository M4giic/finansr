"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { Category } from "@prisma/client";
import { createCategory } from "@/app/actions/categories";

interface CategoryPickerProps {
    categoryId: string | null;
    categories: Category[];
    onSelect: (categoryId: string) => void;
    onCategoryCreated?: (category: Category) => void;
}

export function CategoryPicker({ categoryId, categories, onSelect, onCategoryCreated }: CategoryPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [localCategories, setLocalCategories] = React.useState(categories);
    const [isCreating, setIsCreating] = React.useState(false);

    // Sync with parent categories
    React.useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    const selectedCategory = localCategories.find((c) => c.id === categoryId);

    const handleCreateCategory = async () => {
        if (!searchValue.trim()) return;

        setIsCreating(true);
        const result = await createCategory(searchValue.trim());
        setIsCreating(false);
        if (result.success && result.category) {
            setLocalCategories([...localCategories, result.category]);
            onSelect(result.category.id);
            onCategoryCreated?.(result.category);
            setOpen(false);
            setSearchValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Only handle Enter if user is typing and hasn't navigated to an item
        // The Command component will handle Enter for selecting highlighted items
        if (e.key === 'Enter' && searchValue.trim()) {
            // Check if there's an exact match
            const exactMatch = localCategories.find(
                c => c.name.toLowerCase() === searchValue.toLowerCase()
            );

            // Only create new category if:
            // 1. No exact match exists
            // 2. User hasn't started navigating with arrows (Command handles that)
            if (!exactMatch && !e.defaultPrevented) {
                // Let Command component handle selection if user navigated
                // We'll only create if the input still has focus and no item is selected
                const commandList = document.querySelector('[cmdk-list]');
                const selectedItem = commandList?.querySelector('[aria-selected="true"]');

                if (!selectedItem) {
                    e.preventDefault();
                    handleCreateCategory();
                }
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedCategory ? selectedCategory.name : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search category..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        onKeyDown={handleKeyDown}
                    />
                    <CommandList>
                        <CommandEmpty>
                            <div className="p-2">
                                <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full h-8"
                                    onClick={handleCreateCategory}
                                    disabled={!searchValue || isCreating}
                                >
                                    {isCreating ? "Creating..." : `Create "${searchValue}"`}
                                </Button>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {localCategories.map((category) => (
                                <CommandItem
                                    key={category.id}
                                    value={category.name}
                                    onSelect={() => {
                                        onSelect(category.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            categoryId === category.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {category.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
