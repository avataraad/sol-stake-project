
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useUserWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserWallet();
  }, []);

  const fetchUserWallet = async () => {
    try {
      const { data: userWallet } = await supabase
        .from('user_wallets') // Corrected table name
        .select('wallet_address')
        .maybeSingle();

      if (userWallet) {
        setWalletAddress(userWallet.wallet_address);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const updateWallet = async (newAddress: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({ wallet_address: newAddress })
        .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id));

      if (error) throw error;

      setWalletAddress(newAddress);
      toast({
        title: "Success",
        description: "Wallet address updated successfully",
      });
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    walletAddress,
    isLoading,
    updateWallet
  };
};
