import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PreviewOfficeHour } from "@/services/userService";
import { TruncatedText } from "../ui/truncated-text";



export const PreviewTable = ({ data }: { data: PreviewOfficeHour[] }) => {

  return (
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
            <TableCell>{item.day}</TableCell>
            <TableCell>{item.start_time}</TableCell>
            <TableCell>{item.end_time}</TableCell>
            <TableCell>{item.mode}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell><TruncatedText text={item.link} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};