"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { updateTransactionWanted } from "@/app/actions/transactions";

interface WantedSelectorProps {
    transactionId: string;
    wantedLevel: string | null;
}

const WANTED_LEVELS = [
    { value: "HAD_TO", label: "Had to" },
    { value: "WANTED", label: "Wanted" },
    { value: "DIDNT_NEED", label: "Didn't need" },
    { value: "REGRET", label: "Regret" },
];

export function WantedSelector({ transactionId, wantedLevel }: WantedSelectorProps) {
    const handleChange = async (value: string) => {
        await updateTransactionWanted(transactionId, value);
    };

    return (
        <Select value={wantedLevel || undefined} onValueChange={handleChange}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
                {WANTED_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                        {level.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
