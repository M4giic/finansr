"use client";

import { useState } from "react";
import { Category, Account, Subcategory } from "@prisma/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";
import { createSubcategory, updateSubcategory, deleteSubcategory } from "@/app/actions/manage-subcategories";
import { createCategory } from "@/app/actions/categories";
import { deleteCategory } from "@/app/actions/delete-category";

type CategoryWithAccount = Category & {
    account?: Account | null;
    subcategories?: Subcategory[];
};

interface CategoryManagerProps {
    initialCategories: CategoryWithAccount[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
    const [newSubName, setNewSubName] = useState("");
    const [addingCategoryTo, setAddingCategoryTo] = useState<string | null>(null); // accountId or "Global"
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setEditName(category.name);
    };

    const handleSave = async (id: string) => {
        // TODO: Implement server action for updating category name
        console.log("Update category:", id, editName);
        setEditingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        const result = await deleteCategory(id);
        if (result.success) {
            setCategories(categories.filter(c => c.id !== id));
        } else {
            alert("Failed to delete category");
        }
    };

    const handleAddCategory = async (accountId: string | null) => {
        if (!newCategoryName.trim()) return;

        const result = await createCategory(newCategoryName.trim(), accountId);
        if (result.success && result.category) {
            // Add to local state
            const newCat: CategoryWithAccount = {
                ...result.category,
                account: accountId ? initialCategories.find(c => c.accountId === accountId)?.account : null,
                subcategories: []
            };
            setCategories([...categories, newCat]);
            setAddingCategoryTo(null);
            setNewCategoryName("");
        } else {
            alert("Failed to create category");
        }
    };

    const handleAddSubcategory = async (categoryId: string) => {
        if (!newSubName.trim()) return;

        const result = await createSubcategory(newSubName.trim(), categoryId);
        if (result.success && result.subcategory) {
            // Update local state
            setCategories(prev => prev.map(cat => {
                if (cat.id === categoryId) {
                    return {
                        ...cat,
                        subcategories: [...(cat.subcategories || []), result.subcategory!]
                    };
                }
                return cat;
            }));
            setAddingSubTo(null);
            setNewSubName("");
        }
    };

    const handleEditSubcategory = async (id: string, name: string) => {
        const result = await updateSubcategory(id, name);
        if (result.success) {
            // Update local state
            setCategories(prev => prev.map(cat => ({
                ...cat,
                subcategories: cat.subcategories?.map(sub =>
                    sub.id === id ? { ...sub, name } : sub
                )
            })));
        }
    };

    const handleDeleteSubcategory = async (id: string, categoryId: string) => {
        if (!confirm("Are you sure you want to delete this subcategory?")) return;

        const result = await deleteSubcategory(id);
        if (result.success) {
            // Update local state
            setCategories(prev => prev.map(cat => {
                if (cat.id === categoryId) {
                    return {
                        ...cat,
                        subcategories: cat.subcategories?.filter(sub => sub.id !== id)
                    };
                }
                return cat;
            }));
        }
    };

    // Group categories by account
    const grouped = categories.reduce((acc, cat) => {
        const key = cat.account?.name || "Global";
        if (!acc[key]) acc[key] = [];
        acc[key].push(cat);
        return acc;
    }, {} as Record<string, CategoryWithAccount[]>);

    // Ensure Global is always present
    if (!grouped["Global"]) {
        grouped["Global"] = [];
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>

            {Object.entries(grouped).map(([accountName, cats]) => (
                <div key={accountName} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm text-gray-600">{accountName}</h4>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setAddingCategoryTo(accountName)}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Category
                        </Button>
                    </div>

                    {addingCategoryTo === accountName && (
                        <div className="flex gap-2 items-center mb-2 p-2 bg-gray-50 rounded border">
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New category name"
                                className="h-8"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const accountId = accountName === "Global" ? null : cats[0]?.accountId;
                                        if (accountId !== undefined) {
                                            handleAddCategory(accountId);
                                        }
                                    }
                                    if (e.key === 'Escape') { setAddingCategoryTo(null); setNewCategoryName(""); }
                                }}
                            />
                            <Button size="sm" onClick={() => {
                                const accountId = accountName === "Global" ? null : cats[0]?.accountId;
                                if (accountId !== undefined) {
                                    handleAddCategory(accountId);
                                }
                            }}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setAddingCategoryTo(null); setNewCategoryName(""); }}>Cancel</Button>
                        </div>
                    )}

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cats.map((category) => (
                                    <>
                                        <tr key={category.id} className="border-t hover:bg-gray-50">
                                            <td className="p-3">
                                                {editingId === category.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="h-8"
                                                        />
                                                        <button
                                                            onClick={() => handleSave(category.id)}
                                                            className="p-1 hover:bg-green-50 rounded text-green-600"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1 hover:bg-red-50 rounded text-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="font-medium">{category.name}</div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${category.status === "SUBMITTED"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {category.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    {editingId !== category.id && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(category)}
                                                                className="p-1 hover:bg-blue-50 rounded text-blue-600"
                                                                title="Edit category"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setAddingSubTo(category.id)}
                                                                className="p-1 hover:bg-green-50 rounded text-green-600"
                                                                title="Add subcategory"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="p-1 hover:bg-red-50 rounded text-red-600"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Add Subcategory Row */}
                                        {addingSubTo === category.id && (
                                            <tr className="bg-blue-50">
                                                <td colSpan={3} className="p-3">
                                                    <div className="flex items-center gap-2 pl-8">
                                                        <span className="text-gray-500">→</span>
                                                        <Input
                                                            value={newSubName}
                                                            onChange={(e) => setNewSubName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleAddSubcategory(category.id);
                                                                if (e.key === 'Escape') { setAddingSubTo(null); setNewSubName(""); }
                                                            }}
                                                            placeholder="Subcategory name"
                                                            className="h-8 flex-1"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddSubcategory(category.id)}
                                                        >
                                                            Add
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => { setAddingSubTo(null); setNewSubName(""); }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Subcategories */}
                                        {category.subcategories?.map((subcategory) => (
                                            <tr key={subcategory.id} className="border-t bg-gray-50 hover:bg-gray-100">
                                                <td className="p-3 pl-8">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400">→</span>
                                                        <span className="text-sm">{subcategory.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-xs text-gray-500">Subcategory</span>
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => handleDeleteSubcategory(subcategory.id, category.id)}
                                                        className="p-1 hover:bg-red-50 rounded text-red-600"
                                                        title="Delete subcategory"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
