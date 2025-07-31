import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface PasswordModalProps {
  isOpen: boolean;
  title: string;
  onPasswordCorrect: () => void;
  expectedPassword: string;
}

export default function PasswordModal({ isOpen, title, onPasswordCorrect, expectedPassword }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      setPassword("");
      setError("");
      onPasswordCorrect();
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center text-xl font-semibold text-gray-800">
            <Lock className="w-5 h-5 mr-2 text-gorgeous-pink" />
            {title}
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">Enter password to access</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="mt-1 w-full"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gorgeous-pink hover:bg-gorgeous-pink-dark text-white"
          >
            Access
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}