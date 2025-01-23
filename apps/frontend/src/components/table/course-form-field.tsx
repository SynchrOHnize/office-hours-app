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
    course: Course;
    setCourse: (course: Course) => void;
}

export const CourseFormField = ({ course, setCourse }: CourseFormFieldProps) => {
    const [searchResults, setSearchResults] = useState<SearchClass[] | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isInstructorFocused, setIsInstructorFocused] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [instructors, setInstructors] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const handleInput = async (value: string) => {
        setInputValue(value);
        if (value.length > 1) {
            const classes = await searchClasses(value);
            setSearchResults(classes || []);
        } else {
            setSearchResults(null);
        }
    };

    const handleSelectClass = async (selectedClass: SearchClass) => {
        const course_code = selectedClass.code;
        const title = selectedClass.title;
        const instructor = selectedClass.instructors[0];
        const updatedCourse: Course = { course_code, title, instructor };
        setCourse(updatedCourse);
        setInputValue(course_code);
        setInstructors(selectedClass.instructors);
        setIsFocused(false);

        const classes = await searchClasses(course_code);
        setSearchResults(classes || []);
    };

    const handleSelectInstructor = async (instructor: string) => {
        if (!course.course_code || !course.title) {
            return;
        }

        const newCourse = { ...course, instructor };
        setCourse(newCourse);
    }

    return (
        <>
            <FormItem className="flex flex-col">
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
                        />
                        {(searchResults?.length || 0) > 0 && isFocused && (
                            <Command className="h-fit absolute top-full left-0 right-0 z-50 mt-1 border rounded-md bg-popover">
                                <CommandList>
                                    <CommandGroup className="overflow-auto">
                                        {searchResults?.map((result) => (
                                            <CommandItem
                                                key={result.code + result.title}
                                                onSelect={() => handleSelectClass(result)}
                                                className="cursor-pointer"
                                            >
                                                <span>
                                                    {result.code.replace(/\s+/g, "")} - {result.title}
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

            <FormItem>
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

            <FormItem>
                <FormLabel>Instructor</FormLabel>
                <FormControl>
                    <div className="relative">
                    <Input
                        value={course?.instructor || ""}
                        readOnly
                        placeholder={
                            instructors && instructors.length === 0
                                ? "No results found."
                                : "Course instructor will appear here..."
                        }
                        onFocus={() => setIsInstructorFocused(true)}
                        onBlur={() => {
                            // Small delay to allow click events on CommandItems to fire
                            setTimeout(() => {
                                setIsInstructorFocused(false);
                            }, 200);
                        }}
                    />
                    {(instructors?.length || 0) > 0 && isInstructorFocused && (
                        <Command className="h-fit absolute top-full left-0 right-0 z-50 mt-1 border rounded-md bg-popover">
                            <CommandList>
                                <CommandGroup className="overflow-auto">
                                    {instructors?.map((instructor) => (
                                        <CommandItem
                                            key={instructor}
                                            onSelect={() => handleSelectInstructor(instructor)}
                                            className="cursor-pointer"
                                        >
                                            <span>
                                                {instructor}
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
        </>
    );
};
