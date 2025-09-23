import { useLogout } from "@/hooks/profile/useLogout";

export function SettingsPage() {
  const { mutate: logout, isPending } = useLogout();
  return (
    <div className="space-y-1">
      {/* Account Section */}
      <div
        className=" backdrop-blur-sm 
        rounded-xl border overflow-hidden"
      >
        <div className="px-4 py-3 border-b bg-sidebar-accent">
          <h2 className="text-sm font-medium ">Account</h2>
        </div>
        <div className="divide-y ">
          <div className="px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="text-sm ">Name</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Update your display name
            </div>
          </div>
          <div className="px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="text-sm ">Email</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Change your email address
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className=" backdrop-blur-sm rounded-xl border border-gray-200/20 overflow-hidden">
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="w-full px-4 py-3 text-left hover:bg-red-50/50 transition-colors disabled:opacity-50"
        >
          <div className="text-sm text-red-600 font-medium">Sign Out</div>
          <div className="text-xs text-red-400 mt-0.5">
            Sign out of your account
          </div>
        </button>
      </div>
    </div>
  );
}
