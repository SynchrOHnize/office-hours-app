"use client"
import { useState } from "react";
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
import { SelectedCourse, storeCourse, storeOfficeHour } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CourseFormField } from "./course-form-field";

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
        z.string().regex(/^[A-Z]+[0-9]+$/, 'Location must be uppercase letters followed by numbers (e.g., MALA5200)').optional(),
        z.string().length(0)
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

export function InsertWithForm() {
    const [course, setCourse] = useState<SelectedCourse>({});
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            host: "",
            location: "",
            link: "",
            start_time: "",
            end_time: "",
        },
    })

    const mode = form.watch("mode")

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!course || !course.course_code || !course.title || !course.instructor) {
            toast({
                title: "Error!",
                description: "Please select a course and instructor.",
                variant: "destructive",
            })
            return;
        }
        let coursePayload = await storeCourse(course);
        if (coursePayload?.statusCode !== 200) {
            toast({
                title: "Error!",
                description: "Failed to store course. Please try again.",
                variant: "destructive",
            })
            return
        }
        const courseId = coursePayload?.data.id || 0;

        const officeHour = await storeOfficeHour(courseId, data);
        if (!officeHour) {
            console.error("Failed to create office hour");
            return;
        }

        toast({
            title: "Success!",
            description: "Office hours created successfully.",
            variant: "success",
        })
        console.log("Course and office hour created successfully");
        await queryClient.invalidateQueries({ queryKey: ['officeHours'] });
        await queryClient.invalidateQueries({ queryKey: ['userCourses'] });
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
                <CourseFormField course={course} setCourse={setCourse} />

                <hr className="my-4 border-t border-border" />


                {/* Rest of the form fields remain unchanged */}
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Day of the week:</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    )}
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Modality:</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    )}
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
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}