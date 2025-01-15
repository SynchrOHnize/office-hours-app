"use client"

import { ColumnDef } from "@tanstack/react-table"
// import { DataTableColumnHeader } from "@/components/ui/table-column-headers"
import { OfficeHour } from "@/services/userService"
import { Checkbox } from "@/components/ui/checkbox"


export const columns: ColumnDef<OfficeHour>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "course_code",
    header: "Course Code",
    // filterFn: 'myMultiFilter',
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="Course Code" />
    // ),
  },
  {
    accessorKey: "host",
    header: "Host",
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="Host" />
    // ),
  },
  {
    accessorKey: "day",
    header: "Day",
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
  },
  {
    accessorKey: "end_time",
    header: "End Time",
  },
  {
    accessorKey: "mode",
    header: "Mode",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "link",
    header: "Link (Hover)",
  },
]
