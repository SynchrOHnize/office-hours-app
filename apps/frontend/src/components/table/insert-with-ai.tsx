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

import { Course, PreviewOfficeHour } from "@/services/userService";
import { parseOfficeHoursJson, parseOfficeHoursText } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { PreviewTable } from "./preview-table";
import { Loader2, Upload } from "lucide-react";
import OpenAILogo from "@/assets/openai-logo.png";
import { CourseFormField } from "./course-form-field";
import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';
const textSchema = z.object({
    raw_text: z.string().min(1, {
        message: "Inputted text cannot be empty",
    }),
})

export function InsertWithAI() {
    const [course, setCourse] = useState<Course | null>(null);
    const [parsedResults, setParsedResults] = useState<PreviewOfficeHour[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [parsingMarkdown, setParsingMarkdown] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof textSchema>>({
        resolver: zodResolver(textSchema),
        defaultValues: {
            raw_text: "",
        },
    })

    // Handle the file input change event
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("File selected");
            setParsingMarkdown(true); // Start parsing
            const reader = new FileReader();
    
            reader.onload = async (e) => {
                try {
                    // Read the file content as text
                    const htmlContent = e.target?.result;
                    if (!htmlContent || typeof htmlContent !== 'string') {
                        toast({
                            title: "Error!",
                            description: "Failed to read file",
                            variant: "destructive",
                        });
                        setParsingMarkdown(false); // Stop parsing
                        event.target.value = ""; // Reset file input
                        return;
                    }
    
                    // Convert HTML to Markdown
                    let convertedMarkdown = convertHtmlToMarkdown(htmlContent);
                    const response = await parseOfficeHoursText(convertedMarkdown);
                    if (response?.statusCode !== 200) {
                        toast({
                            title: "Error!",
                            description: "Failed to parse office hours into text with AI.",
                            variant: "destructive",
                        });
                    } else {
                        convertedMarkdown = response.data;
                    }
                    form.setValue("raw_text", form.getValues("raw_text") + "\n" + convertedMarkdown);
                } catch (err) {
                    toast({
                        title: "Error!",
                        description: "Failed to convert HTML to Markdown",
                        variant: "destructive",
                    });
                } finally {
                    setParsingMarkdown(false); // Ensure parsing stops
                    event.target.value = ""; // Reset file input
                }
            };
    
            reader.readAsText(file); // Read the file content
        }
    };

    const onSubmit = async (data: z.infer<typeof textSchema>) => {
        if (!course) {
            toast({
                title: "Error!",
                description: "Please select a course.",
                variant: "destructive",
            })
            return;
        }

        setIsLoading(true);
        let response = await parseOfficeHoursJson(course.course_id, data.raw_text);
        setIsLoading(false);
        if (response?.status !== 200) {
            if (response?.status === 429) {
                toast({
                    title: "Error!",
                    description: "Too many requests, please try again later.",
                    variant: "destructive",
                })
            } else {
                console.error("Failed to create office hours");
                toast({
                    title: "Error!",
                    description: "Please ensure the text has all fields for each data point.",
                    variant: "destructive",
                })
            }
            setShowTip(true);
            return;
        }

        const payload = response.data;
        const officeHours = payload.data as PreviewOfficeHour[];

        setParsedResults(officeHours);

        if (officeHours.length === 0) {
            toast({
                title: "No Data Found",
                description: "No office hours found. Please ensure the text has all fields for each data point.",
                variant: "default",
            })
            setShowTip(true);
            return;
        }

        toast({
            title: "Success!",
            description: "Office hours parsed successfully.",
            variant: "success",
        })
        console.log("Course and office hour created successfully");
    }
    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
                    <CourseFormField course={course} setCourse={setCourse} />

                    <hr className="my-4 border-t border-border" />


                    {/* Rest of the form fields remain unchanged */}
                    <FormItem>
                        <FormLabel>Parse HTML (Recommended)</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    accept=".html"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="min-w-24 flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{parsingMarkdown ? "Parsing File..." : "Upload File"}</span>
                                </label>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <div className="flex items-center justify-center">
                        <hr className="w-1/2 border-t border-gray-300" />
                        <span className="mx-4 text-gray-500">Or</span>
                        <hr className="w-1/2 border-t border-gray-300" />
                    </div>
                    <FormField
                        control={form.control}
                        name="raw_text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Raw Text</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Copy and paste raw text containing your office hours. Commonly found in Canvas Syllabus, Files, or Announcements."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                {showTip && <div className="text-sm text-gray-500 italic">
                                    Tip: Try calling GPT again if the output is not sufficient. Ensure the text has all fields (can be seen in the form section).
                                </div>}
                            </FormItem>
                        )}
                    />

                    <hr className="my-4 border-dotted border-1 border-gray-300" />
                    <Button type="submit" variant={"outline"} className="font-bold text-md">
                        {isLoading ? <>Parsing <Loader2 className="mr-2 h-5 w-5 animate-spin" /></> : "Parse with AI"}
                    </ Button>
                    <span className="text-xs font-normal mx-auto flex items-center justify-center gap-1">
                        Powered by GPT-4o
                        <img src={OpenAILogo} alt="OpenAI Logo" className="h-4 w-4" />
                    </span>
                </form>
            </Form>
            {parsedResults.length > 0 && <PreviewTable data={parsedResults} setData={setParsedResults} />}
        </>
    )
}
