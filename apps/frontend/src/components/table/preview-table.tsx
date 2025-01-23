import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PreviewOfficeHour, storeOfficeHourList } from "@/services/userService";
import { TruncatedText } from "@/components/ui/truncated-text";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { EditPreview } from "./edit-preview";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { capitalize } from "@/lib/utils";



export const PreviewTable = ({ data, setData }: { data: PreviewOfficeHour[], setData: (data: PreviewOfficeHour[]) => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    for (const item of data) {
      if ([item.host, item.day, item.start_time, item.end_time, item.mode, item.location, item.link].includes("INVALID")) {
        setInvalid(true);
        return;
      }
    }
    setInvalid(false);
  }, [JSON.stringify(data)]);


  const onSubmit = async () => {
    setLoading(true);
    for (const item of data) {
      if ([item.host, item.day, item.start_time, item.end_time, item.mode, item.location, item.link].includes("INVALID")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please correct the invalid fields.",
        });
        setLoading(false);
        return null; // Return null to indicate an invalid entry
      }
    }

    const officeHours = data.map((item) => {
      const updatedItem = JSON.parse(JSON.stringify(item));
      updatedItem.day = updatedItem.day.toLowerCase();
      updatedItem.mode = updatedItem.mode.toLowerCase();
      updatedItem.start_time = format(parse(updatedItem.start_time, 'h:mm a', new Date()), 'HH:mm');
      updatedItem.end_time = format(parse(updatedItem.end_time, 'h:mm a', new Date()), 'HH:mm');
      return updatedItem;
    })

    const response = await storeOfficeHourList(officeHours);
    if (response?.statusCode === 200) {
      toast({
        variant: "success",
        title: "Success",
        description: `${response?.data.length} Office hours stored successfully.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['officeHours'] });
      await queryClient.invalidateQueries({ queryKey: ['userCourses'] });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save office hours.",
      })
    }
    setLoading(false);
  };


  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Host</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.host}</TableCell>
              <TableCell>{capitalize(item.day).slice(0, 3)}.</TableCell>
              <TableCell>
                {item.start_time}
              </TableCell>
              <TableCell>
                {item.end_time}
              </TableCell>
              <TableCell>{capitalize(item.mode)}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell><TruncatedText text={item.link} /></TableCell>
              <TableCell>
                <EditPreview row={item} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => {
                  const newData = data.filter((_, idx) => idx !== index);
                  setData(newData);
                  console.log(newData);
                }}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onSubmit} className={invalid ? "bg-red-500" : "bg-blue-500"} disabled={invalid}>
        {!loading && (invalid ? "Fix Invalid Fields" : "Store Office Hours")}
        {loading && <Loader2 className="animate-spin" size={64} />}
      </Button>
    </>
  );
};