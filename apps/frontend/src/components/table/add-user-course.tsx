import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListFilter, Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllCourses, fetchUserCourses, storeUserCourse, deleteUserCourse } from "@/services/userService";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const AddCourseInput = ({
    empty = false,
}: {
    empty: boolean;
}) => {
    const [inputValue, setInputValue] = useState("");
    const [showAll, setShowAll] = useState(false);
    const queryClient = useQueryClient();

    const { data: userCourses = [] } = useQuery({
        queryKey: ['userCourses'],
        queryFn: fetchUserCourses,
    });

    const userCourseCodes = userCourses.map(course => course.course_code);

    const { data: allCourses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: fetchAllCourses,
    });

    const storeMutation = useMutation({
        mutationFn: storeUserCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userCourses'] });
            queryClient.invalidateQueries({ queryKey: ['officeHours'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUserCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userCourses'] });
            queryClient.invalidateQueries({ queryKey: ['officeHours'] });
        }
    });


    const handleSelect = async (value: string) => {
        console.log(value)
        if (!userCourseCodes.includes(value)) {
            let course = allCourses.find(c =>
                value.includes(c.course_code) && value.includes(c.title)
            );
            if (course) {
                await storeMutation.mutateAsync(course.course_id);
            }
        }
        setInputValue("");
    };

    const handleRemove = async (e: React.MouseEvent, codeToRemove: string) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the DialogTrigger
        const course = userCourses.find(c => c.course_code === codeToRemove);
        if (course) {
            await deleteMutation.mutateAsync(course.course_id);
        }
    };

    const filteredCourses = allCourses.filter(course =>
        !userCourseCodes.includes(course.course_code)
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {empty ?
                    <Button variant="outline">
                        <span>Add your first course!</span>
                        <Plus className="w-4 h-4 text-gray-400" />
                    </Button>
                    :
                    <Button variant="outline" className="w-full justify-center hover:bg-white cursor-text px-2">
                        {userCourseCodes.length > 0 && (
                            <div className="flex gap-1">
                                {userCourseCodes.map(code => (
                                    <Badge key={code} variant="secondary" className="rounded-sm py-1 pr-2">
                                        {code}
                                        <div
                                            className="ml-1 hover:bg-slate-200 rounded-full cursor-pointer"
                                            onClick={(e) => handleRemove(e, code)}
                                        >
                                            <X className="h-3 w-3" onClick={(e) => handleRemove(e, code)} />
                                        </div>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <span className="text-muted-foreground">Select Courses...</span>
                        <Search className="w-4 h-4 text-gray-400" />

                    </Button>
                }
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Select Courses</DialogTitle>
                    <DialogDescription>
                        Add the courses you are taking this semester.
                    </DialogDescription>
                </DialogHeader>
                <div className={cn(userCourseCodes.length > 0 && "w-full")}>
                    <Command className="rounded-lg border shadow-md">
                        <div className="flex flex-wrap gap-1 p-1">
                            {userCourseCodes.map(code => (
                                <Badge key={code} variant="secondary" className="h-7">
                                    {code}
                                    <button
                                        className="ml-1 hover:bg-slate-200 rounded-full"
                                        onClick={(e) => handleRemove(e, code)}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <div className="flex-grow flex-shrink-0 mx-1 relative">
                                <CommandInput
                                    autoFocus
                                    placeholder="Add courses..."
                                    value={inputValue}
                                    onValueChange={setInputValue}
                                    className="h-7 w-full"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAll(!showAll)}
                                    className={cn(
                                        "h-7 px-2 absolute right-0 top-0",
                                        showAll && "bg-slate-100"
                                    )}
                                >
                                    <ListFilter className="h-3 w-3 mr-1" />
                                    {showAll ? "Hide" : "Show All"}
                                </Button>
                            </div>
                        </div>
                        {<CommandList>
                            {(!inputValue && !showAll) ? null : (
                                <>
                                    <CommandEmpty>No courses found.</CommandEmpty>
                                    <CommandGroup className="max-h-[200px] overflow-auto">
                                        {filteredCourses.map((course) => (
                                            <CommandItem
                                                key={course.course_id}
                                                value={`${course.course_code} ${course.title}`}
                                                onSelect={handleSelect}
                                            >
                                                {course.course_code} - {course.title}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>}
                    </Command>
                </div>
            </DialogContent>
        </Dialog>
    );
};