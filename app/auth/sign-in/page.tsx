"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch("/api/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      toast.success("Login successful");
      redirect("/");
    } else {
      console.log(data.error);
      toast.error("Login failed: " + data.error);
      setPassword("");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sign In
          <div>
            <ThemeToggle />
          </div>
        </CardTitle>
        <CardDescription>Sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-2 w-full"
        >
          <label className="space-y-1">
            <p className="text-sm">Username</p>
            <Input
              type="text"
              placeholder="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </label>
          <label className="space-y-1">
            <p className="text-sm">Password</p>
            <Input
              type="password"
              placeholder="******"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </label>
          <Button className="w-full">Sign In</Button>
        </form>
      </CardContent>
    </Card>
  );
}
