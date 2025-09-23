import { ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrainingSessionProps {
  date: {
    day: string;
    month: string;
  };
  title: string;
  time: string;
  assignments: number;
  location: string;
  status: "Finished" | "Upcoming" | "In Progress";
}

export function TrainingSession({
  date,
  title,
  time,
  assignments,
  location,
  status,
}: TrainingSessionProps) {
  return (
    <Card className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer group">
      <div className="flex flex-col items-center justify-center min-w-[60px] text-center">
        <div className="text-3xl font-bold text-foreground">{date.day}</div>
        <div className="text-sm text-muted-foreground uppercase">
          {date.month}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{assignments} assignments</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant={
            status === "Finished"
              ? "secondary"
              : status === "In Progress"
              ? "default"
              : "outline"
          }
          className="font-normal"
        >
          {status}
        </Badge>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </Card>
  );
}
