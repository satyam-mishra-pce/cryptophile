import Avatar from "@/components/common/avatar";
import useUserStore from "@/store/user";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

type UserOptionsProps = {};

const UserOptions = ({}: UserOptionsProps) => {
  const user = useUserStore((state) => state.userInfo);
  return (
    <button className="bg-foreground/10 rounded-lg w-full p-2 flex hover:bg-foreground/20 justify-between items-center">
      {user && (
        <div className="flex gap-2">
          <Avatar address={user.avatarHex} size={20} />
          <span className="text-sm font-bold">
            {user.displayName.length > 10
              ? user.displayName.split(" ")[0]
              : user.displayName}
          </span>
        </div>
      )}
      <ChevronsUpDown className="h-5 shrink-0 opacity-50" />
    </button>
  );
};

export default UserOptions;
