"use client"
import { Plus, Star } from "lucide-react"
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { InsertWithForm } from "./insert-with-form";
import { InsertWithAI } from "./insert-with-ai";

export function InsertOfficeHoursForm() {
    const [isForm, setIsForm] = useState(true); // True = form style, False = text style

    return (
        <>
            <Dialog>
                <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium border border-input bg-green-200 hover:bg-green-400 hover:text-accent-foreground">
                    Insert
                    <Plus className="h-4 w-4" />
                </DialogTrigger>
                <DialogContent className={cn("overflow-y-scroll max-h-screen", isForm ? "max-w-xl" : "max-w-4xl")}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Create Office Hours</DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-40">
                            If you are seeing this, it means you are a verified TA or instructor at UF.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 grid-rows-2 text-center max-w-xs m-auto">
                        <Button variant={"ghost"} onClick={() => setIsForm(true)} className={cn(isForm ? "font-bold" : "", "text-md")}>
                            Standard Form
                        </Button>
                        <Button variant={"ghost"} onClick={() => setIsForm(false)} className={cn(!isForm ? "font-bold" : "", "text-md")}>
                            Parse with AI
                            <Star className="h-4 w-4" />
                        </Button>
                        <span></span>
                        <span className="text-xs">(Recommended)</span>
                    </div>
                    {isForm && <InsertWithForm />}
                    {!isForm && <InsertWithAI />}
                </DialogContent>
            </Dialog>
        </>
    )
}