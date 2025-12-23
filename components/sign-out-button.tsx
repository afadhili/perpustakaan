import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    const res = await fetch("/api/sign-out", {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Logged out successfully");
      redirect("/auth/sign-in");
    }
  };

  return (
    <Button onClick={handleSignOut}>
      Sign Out <LogOut className="w-4 h-4 ml-2" />
    </Button>
  );
}
