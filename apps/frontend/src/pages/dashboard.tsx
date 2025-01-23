import { columns } from "../components/table/columns";
import { fetchOfficeHours, fetchUser, healthCheck } from "@/services/userService";
import { DataTable } from "../components/table/data-table";
import { AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const [health, setHealth] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });

  useEffect(() => {
    const checkHealth = async () => {
      const newHealth = await healthCheck();
      setHealth(newHealth);
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (user?.new) {
      if (user.role === "student") {
        toast({
          variant: "success",
          title: "UF email detected.",
          description: "Welcome to OHsync. Please add your courses to get started.",
        });
      } else {
        toast({
          variant: "success",
          title: "UF email detected. Professor/TA detected from UF faculty directory.",
          description: "Welcome to OHsync. Please insert your courses' office hours.",
        });
      }
    }
  }, [user]);

  const admin = ["admin", "professor", "teaching_assistant"].includes(user?.role || "")

  const { data: officeHours = [], isLoading } = useQuery({
    queryKey: ['officeHours'],
    queryFn: fetchOfficeHours,
    enabled: !!user
  });

  if (isLoading || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={64} />
      </div>
    );
  }

  return (
    <div className="h-screen pt-10">
      <div className="py-20 mx-5 md:mx-10 flex flex-col items-center justify-center w-screen">
        {user && <DataTable columns={columns} data={officeHours} admin={admin} />}
        {!user && health &&
          <div className="text-nowrap  mb-5 bg-red-100 border border-red-200 text-red-900 px-4 py-3 rounded-lg flex items-center relative">
            <AlertCircle className="w-6 h-6 mr-3 text-red-600" />
            <span>
              <strong>Error:</strong> Non-UF email detected. Please log in with a UF email or contact melvin.chen@ufl.edu.
            </span>
          </div>
        }
        {!user && !health &&
          <div className="text-nowrap  mb-5 bg-red-100 border border-red-200 text-red-900 px-4 py-3 rounded-lg flex items-center relative">
            <AlertCircle className="w-6 h-6 mr-3 text-red-600" />
            <span>
              <strong>Error:</strong> Server is down. Please contact melvin.chen@ufl.edu.
            </span>
          </div>
        }
      </div>
    </div>
  );
}