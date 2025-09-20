"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";

export default function AuthForm() {
  // Get login and register functions from context
  const { signIn, signUp } = useAuth();

  // Form state - what the user is doing
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register

  // Input field values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Messages to show user
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Don't refresh the page

    try {
      if (isLogin) {
        // User wants to login
        await signIn(email, password);
        console.log("Logged in successfully");
        setSuccess(null); // No success message for login
      } else {
        // User wants to register
        const fullName = `${firstName} ${lastName}`;
        await signUp(email, password, fullName);
        console.log("Registered successfully (check your email!)");
        setSuccess("Registered successfully! Check your email to confirm.");
      }
      
      setError(null); // Clear any previous errors
    } catch (err: any) {
      // Something went wrong
      setError(err.message);
      setSuccess(null); // Clear success message
    }
  };

  // Switch between login and register
  const toggleFormType = () => {
    setIsLogin(!isLogin);
    // Clear form when switching
    setError(null);
    setSuccess(null);
  };

  return (
    <Card className="w-[350px] mx-auto mt-10">
      {/* Card Header */}
      <CardHeader>
        <CardTitle>
          {isLogin ? "Login" : "Register"}
        </CardTitle>
      </CardHeader>

      {/* Card Content */}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name fields - only show when registering */}
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Email field - always show */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password field - always show */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Show error message if there is one */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full">
            {isLogin ? "Login" : "Register"}
          </Button>
        </form>

        {/* Switch between login/register */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={toggleFormType}
            className="text-sm text-black-600 hover:underline"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>

          {/* Show success message if there is one */}
          {success && (
            <p className="text-green-500 text-sm mt-2">{success}</p>
          )}
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}