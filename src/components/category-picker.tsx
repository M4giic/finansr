"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Category, Subcategory } from "@prisma/client";
import { createCategory } from "@/app/actions/categories";
import { createSubcategory, getSubcategoriesByCategory } from "@/app/actions/manage-subcategories";

interface CategoryPickerProps {
    categoryId: string | null;
    subcategoryId?: string | null;
    categories: Category[];
    onCategorySelect: (categoryId: string) => void;
    onSubcategorySelect?: (subcategoryId: string | null) => void;
    onCategoryCreated?: (category: Category) => void;
    accountId?: string | null;
}

export function CategoryPicker({
    categoryId,
    subcategoryId,
    categories,
    onCategorySelect,
    onSubcategorySelect,
    onCategoryCreated,
    accountId
}: CategoryPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [localCategories, setLocalCategories] = React.useState(categories);
    const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
    const [isCreating, setIsCreating] = React.useState(false);
    const [isAddingNew, setIsAddingNew] = React.useState(false);
    const [newSubName, setNewSubName] = React.useState("");

    // Sync with parent categories
    React.useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    // Load subcategories when category changes
    React.useEffect(() => {
        if (categoryId) {
            loadSubcategories(categoryId);
        } else {
            setSubcategories([]);
        }
        setIsAddingNew(false);
        setNewSubName("");
    }, [categoryId]);

    const loadSubcategories = async (catId: string) => {
        const result = await getSubcategoriesByCategory(catId);
        if (result.success && result.subcategories) {
            setSubcategories(result.subcategories);
        }
    };

    const selectedCategory = localCategories.find((c) => c.id === categoryId);
    const selectedSubcategory = subcategories.find((s) => s.id === subcategoryId);

    const handleCreateCategory = async () => {
        if (!searchValue.trim()) return;

        setIsCreating(true);
        const result = await createCategory(searchValue.trim(), accountId);
        setIsCreating(false);
        if (result.success && result.category) {
            setLocalCategories([...localCategories, result.category]);
            onCategorySelect(result.category.id);
            onCategoryCreated?.(result.category);
            setOpen(false);
            setSearchValue("");
        }
    };

    const handleCreateSubcategory = async () => {
        if (!newSubName.trim() || !categoryId) return;

        setIsCreating(true);
        const result = await createSubcategory(newSubName.trim(), categoryId);
        setIsCreating(false);
        if (result.success && result.subcategory) {
            setSubcategories([...subcategories, result.subcategory]);
            onSubcategorySelect?.(result.subcategory.id);
            setIsAddingNew(false);
            setNewSubName("");
            setOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchValue.trim()) {
            const exactCategoryMatch = localCategories.find(
                c => c.name.toLowerCase() === searchValue.toLowerCase()
            );

            if (!exactCategoryMatch && !e.defaultPrevented) {
                const commandList = document.querySelector('[cmdk-list]');
                const selectedItem = commandList?.querySelector('[aria-selected="true"]');

                if (!selectedItem) {
                    e.preventDefault();
                    handleCreateCategory();
                }
            }
        }
    };

    const displayText = selectedCategory
        ? (selectedSubcategory ? `${selectedCategory.name} → ${selectedSubcategory.name}` : selectedCategory.name)
        : "Select category...";

    return (
        <Popover open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
                setIsAddingNew(false);
                setNewSubName("");
            }
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between text-xs"
                >
                    <span className="truncate">{displayText}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
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
                                    {isCreating ? "Creating..." : `Create category "${searchValue}"`}
                                </Button>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {localCategories.map((category) => (
                                <React.Fragment key={category.id}>
                                    {/* Category Item */}
                                    <CommandItem
                                        value={category.name}
                                        onSelect={() => {
                                            onCategorySelect(category.id);
                                            if (!onSubcategorySelect) {
                                                setOpen(false);
                                            }
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                categoryId === category.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="font-medium">{category.name}</span>
                                    </CommandItem>

                                    {/* Subcategories - only show if this category is selected */}
                                    {categoryId === category.id && onSubcategorySelect && (
                                        <>
                                            {subcategories.map((subcategory) => (
                                                <CommandItem
                                                    key={subcategory.id}
                                                    value={`${category.name} ${subcategory.name}`}
                                                    onSelect={() => {
                                                        onSubcategorySelect(subcategory.id);
                                                        setOpen(false);
                                                    }}
                                                    className="pl-8"
                                                >
                                                    <span className="text-gray-400 mr-2">→</span>
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            subcategoryId === subcategory.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {subcategory.name}
                                                </CommandItem>
                                            ))}

                                            {/* Add New Subcategory */}
                                            {isAddingNew ? (
                                                <div className="pl-8 pr-2 py-2 flex items-center gap-2">
                                                    <span className="text-gray-400">→</span>
                                                    <Input
                                                        value={newSubName}
                                                        onChange={(e) => setNewSubName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleCreateSubcategory();
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setIsAddingNew(false);
                                                                setNewSubName("");
                                                            }
                                                        }}
                                                        placeholder="New subcategory"
                                                        className="h-7 text-xs flex-1"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <CommandItem
                                                    value={`${category.name} add new`}
                                                    onSelect={() => setIsAddingNew(true)}
                                                    className="pl-8 text-blue-600"
                                                >
                                                    <span className="text-gray-400 mr-2">→</span>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    <span className="italic">Add new</span>
                                                </CommandItem>
                                            )}

                                            {/* Option to clear subcategory */}
                                            {subcategoryId && (
                                                <CommandItem
                                                    value={`${category.name} none`}
                                                    onSelect={() => {
                                                        onSubcategorySelect(null);
                                                        setOpen(false);
                                                    }}
                                                    className="pl-8"
                                                >
                                                    <span className="text-gray-400 mr-2">→</span>
                                                    <span className="text-gray-500 italic">None</span>
                                                </CommandItem>
                                            )}
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
