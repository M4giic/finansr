"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface BankSelectorProps {
    banks: string[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function BankSelector({ banks, value, onChange, placeholder = "Select bank..." }: BankSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const filteredBanks = React.useMemo(() => {
        return banks.filter((bank) =>
            bank.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [banks, searchValue])

    const showAddOption = searchValue.length > 0 && !banks.some(b => b.toLowerCase() === searchValue.toLowerCase())

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search bank..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {showAddOption ? (
                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-sm"
                                        onClick={() => {
                                            onChange(searchValue)
                                            setOpen(false)
                                            setSearchValue("")
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add "{searchValue}"
                                    </Button>
                                </div>
                            ) : (
                                "No bank found."
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredBanks.map((bank) => (
                                <CommandItem
                                    key={bank}
                                    value={bank}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                        setSearchValue("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === bank ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {bank}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
