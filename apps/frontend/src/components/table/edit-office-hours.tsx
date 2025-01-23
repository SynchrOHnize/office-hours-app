"use client"
import { Edit } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TimeField } from "../ui/time-field";
import { updateOfficeHour } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
    host: z.string().min(1, {
        message: "Field cannot be empty.",
    }),
    day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
        required_error: "You need to select a day.",
    }),
    start_time: z.string().min(1, {
        message: "Field cannot be empty.",
    }),
    end_time: z.string().min(1, {
        message: "Field cannot be empty.",
    }),
    mode: z.enum(["in-person", "remote", "hybrid"], {
        required_error: "You need to select a mode.",
    }),
    location: z.union([
        z
            .string()
            .regex(/^[A-Z]+[0-9]+$/, "Location must be uppercase letters followed by numbers (e.g., MALA5200)")
            .optional(),
        z.string().length(0),
    ]),
    link: z.union([
        z.string().url(),
        z.string().length(0),
    ]).optional(),
}).superRefine((data, ctx) => {
    if (data.mode === "hybrid") {
        if (!data.location || data.location.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Location is required for hybrid.",
                path: ["location"]
            });
        }
        if (!data.link || data.link.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Link is required for hybrid.",
                path: ["link"]
            });
        }
    } else if (data.mode === "in-person") {
        if (!data.location || data.location.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Location is required for in-person.",
                path: ["location"]
            });
        }
    } else if (data.mode === "remote") {
        if (!data.link || data.link.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Link is required for remote.",
                path: ["link"]
            });
        }
    }
});

// Time is currently stored as a string in 12-hour format (e.g., "12:00 PM")
// But TimeField component expects time in 24-hour format (e.g., "12:00")
function convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.toUpperCase().split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
    }

    const formatted = `${hours.padStart(2, '0')}:${minutes}`

    return formatted;
}

export function EditOfficeHoursForm({ row }: { row: any }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            host: row.host || "",
            day: (row.day || "").toLowerCase(),
            start_time: (convertTo24Hour(row.start_time) || "").toLowerCase(),
            end_time: (convertTo24Hour(row.end_time) || "").toLowerCase(),
            mode: (row.mode || "").toLowerCase(),
            location: row.location || "",
            link: (row.link || "").toLowerCase(),
        },
    });

    const onClick = () => {
        // Reset all the values the same way as before, using the same functions
        form.reset({
            host: row.host || "",
            day: (row.day || "").toLowerCase(),
            start_time: (convertTo24Hour(row.start_time) || "").toLowerCase(),
            end_time: (convertTo24Hour(row.end_time) || "").toLowerCase(),
            mode: (row.mode || "").toLowerCase(),
            location: row.location || "",
            link: row.link || "",
        });
    }


    const mode = form.watch("mode")

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (data.mode === "in-person") {
            data.link = ""
        }
        if (data.mode === "remote") {
            data.location = ""
        }

        const officeHour = await updateOfficeHour(row.id, data);
        if (!officeHour) {
            console.error("Failed to update office hour");
            return;
        }

        toast({
            title: "Success!",
            description: "Office hours updated successfully.",
            variant: "success",
        })
        console.log("Course and office hour updated successfully");
        await queryClient.invalidateQueries({ queryKey: ['officeHours'] });
        window.location.reload();

    }
    return (
        <>
            <Dialog>
                <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium border border-gray-700 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                    <Edit onClick={onClick} className="h-4 w-4" />
                </DialogTrigger>
                <DialogContent className="min-w-96 overflow-y-scroll max-h-screen">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Edit Office Hours</DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-40">
                            If you are seeing this, it means you are a verified TA or instructor at UF.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
                            <FormField
                                control={form.control}
                                name="host"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Host</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="day"
                                render={({ field }) => {
                                    // console.log(field.value)
                                    return <FormItem>
                                        <FormLabel>Day of the week:</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a day..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="monday">Monday</SelectItem>
                                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                                <SelectItem value="thursday">Thursday</SelectItem>
                                                <SelectItem value="friday">Friday</SelectItem>
                                                <SelectItem value="saturday">Saturday</SelectItem>
                                                <SelectItem value="sunday">Sunday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="start_time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Time</FormLabel>
                                            <FormControl>
                                                <TimeField
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="end_time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Time</FormLabel>
                                            <FormControl>
                                                <TimeField
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="mode"
                                render={({ field }) => {
                                    // console.log(field.value)
                                    return <FormItem>
                                        <FormLabel>Modality:</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a modality..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="in-person">In-person</SelectItem>
                                                <SelectItem value="remote">Remote</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                }}
                            />

                            {["in-person", "hybrid"].includes(mode) && (
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Example: MALA5200" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {["remote", "hybrid"].includes(mode) && (
                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Example: https://ufl.zoom.us/j/123456789" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <hr className="my-4 border-dotted border-1 border-gray-300" />
                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Update</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}