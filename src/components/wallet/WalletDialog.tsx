
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WalletDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentWallet: string | null;
  onSubmit: (address: string) => void;
  isLoading: boolean;
}

export const WalletDialog = ({
  isOpen,
  onOpenChange,
  currentWallet,
  onSubmit,
  isLoading
}: WalletDialogProps) => {
  const [newWallet, setNewWallet] = useState(currentWallet || '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentWallet ? 'Update Wallet' : 'Add Wallet'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter Solana wallet address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              onSubmit(newWallet);
              onOpenChange(false);
            }}
            disabled={isLoading || !newWallet}
            className="w-full"
          >
            {isLoading ? 'Processing...' : (currentWallet ? 'Update' : 'Add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
