import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Settings() {
  const { user } = useAuth();
  
  // Form states
  const [firstName, setFirstName] = useState(
    (user?.user_metadata as any)?.first_name || ""
  );
  const [lastName, setLastName] = useState(
    (user?.user_metadata as any)?.last_name || ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get user's display name
  const getDisplayName = () => {
    const fullName = `${
      (user?.user_metadata as any)?.first_name || ""
    } ${(user?.user_metadata as any)?.last_name || ""}`.trim();
    
    return fullName || user?.email || "User";
  };

  // Update user profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        }
      });

      if (error) throw error;

      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/reset-password'
      });

      if (error) throw error;

      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-3xl mx-auto space-y-6 ">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Info Card */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Current Name
            </Label>
            <p className="text-lg font-semibold text-gray-900">
              {getDisplayName()}
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Account Created
            </Label>
            <p className="text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Update Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            {message && (
              <p className="text-green-500 text-sm">{message}</p>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Change your password by requesting a reset email.
          </p>
          
          <Button 
            onClick={handlePasswordReset}
            disabled={loading}
            variant="outline"
            className="w-full md:w-auto"
          >
            {loading ? "Sending..." : "Send Password Reset Email"}
          </Button>
        </CardContent>
      </Card>

      

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <Button 
            variant="destructive" 
            className="w-full md:w-auto"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                // Add delete account logic here
                console.log("Delete account requested");
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}