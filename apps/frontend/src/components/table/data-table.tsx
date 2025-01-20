import { DataTablePagination } from "@/components/ui/data-table-pagination"
// import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Button } from "@/components/ui/button"

import { TruncatedText } from "@/components/ui/truncated-text"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { InsertOfficeHoursForm } from "./insert-office-hours"
import { EditOfficeHoursForm } from "./edit-office-hours"
import { deleteOfficeHours, fetchOfficeHours, fetchUserCourses, getIcalFile, getIcalFileByIds, OfficeHour } from "@/services/userService"
import { useQuery } from "@tanstack/react-query"
import { AddCourseInput } from "./add-user-course"
import { AlertCircle, Filter, Trash, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useState } from "react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    admin: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    admin,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [closedTip, setClosedTip] = useState(false)
    const { toast } = useToast()

    const { refetch } = useQuery({
        queryKey: ['officeHours'],
        queryFn: fetchOfficeHours,
    });

    const { data: userCourses = [] } = useQuery({
        queryKey: ['userCourses'],
        queryFn: fetchUserCourses,
    });

    const table = useReactTable({
        data,
        columns,
        filterFns: {
            myMultiFilter: (row, columnId, filterValue: string[]) =>
                filterValue.length === 0 || filterValue.includes(row.getValue(columnId))
        },
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })


    const handleDownloadIdsClick = async () => {
        if (Object.keys(rowSelection).length === 0) {
            toast({
                title: "Error",
                description: "No rows selected.",
                variant: "destructive",
                duration: 2000,
            });
            return;
        }

        const indices = Object.keys(rowSelection) // "['0', '1', '2']"
        const rows = data.filter((_, index) => indices.includes(index.toString())) as OfficeHour[]
        const ids = rows.map((row) => row.id)

        try {
            const payload = await getIcalFileByIds(ids);
            if (payload && payload.statusCode === 200) {
                const dataUrl = payload.data;

                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = "office_hours.ics";

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                throw new Error("Failed to get iCal file");
            }
        } catch (error) {
            console.error("iCal download error:", error);
        }
    };

    const handleDownloadClick = async () => {
        try {
            const payload = await getIcalFile();
            if (payload && payload.statusCode === 200) {
                const dataUrl = payload.data;

                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = "office_hours.ics";

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                throw new Error("Failed to get iCal file");
            }
        } catch (error) {
            console.error("iCal download error:", error);
        }
    }

    const handleDeleteClick = async () => {
        if (Object.keys(rowSelection).length === 0) {
            toast({
                title: "Error",
                description: "No rows selected.",
                variant: "destructive",
                duration: 2000,
            });
            return;
        }

        const indices = Object.keys(rowSelection) // "['0', '1', '2']"
        const rows = data.filter((_, index) => indices.includes(index.toString())) as OfficeHour[]
        const ids = rows.map((row) => row.id)
        await deleteOfficeHours(ids)
        await refetch()
        setRowSelection({})
    };

    const DeleteButton = () => {
        const numSelected = Object.keys(rowSelection).length;

        return (
            <>
                {numSelected === 0 ? (
                    <Button variant="destructive" size="sm" disabled>
                        Delete
                        <Trash className="h-4 w-4" />
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                            >
                                Delete {numSelected} Selected
                                <Trash className="h-4 w-4" />

                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {numSelected} selected office hours.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteClick} className="bg-red-500 hover:bg-red-700">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </>
        )
    };

    const isRecentlyEdited = (updatedAt: string) => {
        const currentDate = new Date();
        const updatedDate = new Date(updatedAt);
        const timeDiff = updatedDate.getTime() - currentDate.getTime(); // Difference in milliseconds
        const daysDiff = timeDiff / (1000 * 3600 * 24); // Convert to days

        if (daysDiff < 0) {
            return false;
        }
        else if (daysDiff < 7) {
            return true;
        }
        else {
            return false;
        }
    };

    return (
        <div className={cn(table.getRowModel().rows?.length === 0 && "max-w-screen-lg")}>
            {!closedTip && <div className="w-full mb-5 bg-blue-100 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg flex items-center relative">
                <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
                <span>
                    <strong>Tip:</strong> Darker backgrounds indicate that the office hours have recently changed.
                </span>
                <button
                    className="absolute right-0 mr-4 text-blue-600 hover:text-blue-800"
                    onClick={() => setClosedTip(true)}
                    aria-label="Close Tip"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>}
            {/* Top section: Search, filters and action buttons */}
            <div className="flex items-end py-4 gap-4">
                <div className="flex gap-2">
                    {/* <DataTableViewOptions table={table} /> */}
                    <div className="relative">
                        <Input
                            placeholder="Filter course code..."
                            value={(table.getColumn("course_code")?.getFilterValue() as string) ?? ""}
                            onChange={(e) =>
                                table.getColumn("course_code")?.setFilterValue(e.target.value)
                            }
                            className="w-44"
                        />
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="relative">
                        <Input
                            placeholder="Filter host..."
                            value={(table.getColumn("host")?.getFilterValue() as string) ?? ""}
                            onChange={(e) =>
                                table.getColumn("host")?.setFilterValue(e.target.value)
                            }
                            className="w-48"
                        />
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                </div>

                <div className="flex flex-wrap-reverse items-center justify-end gap-4 ml-auto">
                    {userCourses?.length > 0 &&
                        <div>
                            <AddCourseInput empty={false} />
                        </div>}
                    <div className="flex gap-2">
                        {admin && <InsertOfficeHoursForm />}
                        {admin && <DeleteButton />}
                    </div>
                </div>
            </div>

            {/* Main table section */}
            <div className="rounded-md border">
                <Table>
                    {/* Table header with sorting controls */}
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                                {admin && (
                                    <TableHead>
                                        Edit
                                    </TableHead>
                                )}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* Table body with data rows */}
                    <TableBody>
                        {table.getRowModel().rows?.length > 0 ? (
                            table.getRowModel().rows.map((row) => {
                                const officeHour = row.original as OfficeHour;
                                const { updated_at } = officeHour;

                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                         className={cn({
                                            'bg-blue-50': officeHour.mode === 'Remote' && !isRecentlyEdited(updated_at),
                                            'bg-blue-100': officeHour.mode === 'Remote' && isRecentlyEdited(updated_at),
                                            'bg-green-100': officeHour.mode === 'In-person' && !isRecentlyEdited(updated_at),
                                            'bg-green-200': officeHour.mode === 'In-person' && isRecentlyEdited(updated_at),
                                            'bg-yellow-50': officeHour.mode === 'Hybrid' && !isRecentlyEdited(updated_at),
                                            'bg-yellow-200': officeHour.mode === 'Hybrid' && isRecentlyEdited(updated_at),
                                            // 'bg-gradient-to-r from-white to-gray-100': isRecentlyEdited(updated_at),
                                        })}

                                    >
                                        {/* Conditionally render symbol for recently edited records */}
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}
                                                className={cn({
                                                    'text-blue-800': officeHour.mode === 'Remote' && cell.column.id === 'mode',
                                                    'text-green-800': officeHour.mode === 'In-person' && cell.column.id === 'mode',
                                                    'text-yellow-800': officeHour.mode === 'Hybrid' && cell.column.id === 'mode',
                                                    'font-bold': cell.column.id === 'course_code',
                                                })}
                                            >
                                                {/* Special handling for link columns */}
                                                {cell.column.id === 'link' ? (
                                                    <TruncatedText text={cell.getValue() as string} />
                                                ) : (
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                )}
                                            </TableCell>
                                        ))}

                                        {admin && (
                                            <TableCell>
                                                <EditOfficeHoursForm row={row.original} />
                                            </TableCell>
                                        )}
                                    </TableRow>

                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {userCourses?.length > 0 ? (
                                        <p>No office hours found for selected courses.</p>
                                    ) : (
                                        <div className="flex-col flex items-center justify-center gap-2">
                                            <p>You have no courses yet.</p>
                                            <div className="max-w-48">
                                                <AddCourseInput empty={true} />
                                            </div>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table >
            </div >

            {/* Bottom section: Pagination controls and iCal download */}
            < div className="my-3 flex justify-between gap-2" >
                <DataTablePagination table={table} />
                <div className="flex gap-4">
                    <Button disabled={!Object.keys(rowSelection).length} variant="outline" onClick={handleDownloadIdsClick}>{`Download Custom iCal (${Object.keys(rowSelection).length} Selected)`}</Button>
                    <Button variant="outline" onClick={handleDownloadClick}>Download iCal</Button>

                </div>
            </div >
        </div >
    )
}