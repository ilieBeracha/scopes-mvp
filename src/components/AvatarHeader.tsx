import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function AvatarHeader() {
  return (
    <div className="w-full">
      <Avatar className="w-10 h-10 absolute top-4 right-4">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>
          <UserIcon className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
