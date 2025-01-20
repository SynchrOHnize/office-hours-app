import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { SearchClass, searchClasses } from "@/services/searchService";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Course, fetchCourseById, storeCourse } from "@/services/userService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CourseFormFieldProps {
    course: Course | null;
    setCourse: (course: Course) => void;
}

export const CourseFormField = ({ course, setCourse }: CourseFormFieldProps) => {
    const [searchResults, setSearchResults] = useState<SearchClass[] | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const handleInput = async (value: string) => {
        setInputValue(value);
        if (value.length > 1) {
            const response = await searchClasses(value);
            setSearchResults(response?.results || []);
        } else {
            setSearchResults(null);
        }
        setCourse({ course_code: value, course_id: 0, title: "" });
    };

    const handleSelectClass = async (selectedClass: SearchClass) => {
        const updatedCourse: Course = {
            course_id: parseInt(selectedClass.key, 10),
            course_code: selectedClass.code.replace(/\s+/g, "").toUpperCase(),
            title: selectedClass.title,
        };
        setCourse(updatedCourse);
        setInputValue(updatedCourse.course_code);
        const existingCourse = await fetchCourseById(updatedCourse.course_id);
        if (!existingCourse) {
            const response = await storeCourse(updatedCourse);
            if (!response) {
                toast({
                    title: "Error!",
                    description: "Failed to save course.",
                    variant: "destructive",
                });

                return;
            }
            await queryClient.invalidateQueries({ queryKey: ['courses'] });
        }
        setSearchResults([]);
        setIsFocused(false);
    };

    return (
        <div className="flex gap-4 items-center">
            <FormItem className="w-1/2">
                <FormLabel>Course Code (Search)</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Input
                            placeholder="Search course code..."
                            value={inputValue}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                // Small delay to allow click events on CommandItems to fire
                                setTimeout(() => {
                                    setIsFocused(false);
                                }, 200);
                            }}
                            onChange={(e) => handleInput(e.target.value)}
                            className="w-full"
                        />
                        {(searchResults?.length || 0) > 0 && isFocused && (
                            <Command className="h-fit absolute top-full left-0 right-0 z-50 mt-1 border rounded-md bg-popover">
                                <CommandList>
                                    <CommandGroup className="overflow-auto">
                                        {searchResults?.map((result) => (
                                            <CommandItem
                                                key={result?.key}
                                                onSelect={() => handleSelectClass(result)}
                                                className="cursor-pointer"
                                            >
                                                <span>
                                                    {result?.code.replace(/\s+/g, "")} - {result?.title}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        )}
                    </div>
                </FormControl>
                <FormMessage />
            </FormItem>
            <FormItem className="w-1/2">
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                    <Input
                        value={course?.title || ""}
                        readOnly
                        placeholder={
                            searchResults && searchResults.length === 0
                                ? "No results found."
                                : "Course title will appear here..."
                        }
                        className="bg-muted"
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        </div>
    );
};
