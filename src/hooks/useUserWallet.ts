
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
      const { data: userWallet, error } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .maybeSingle();

      if (error) throw error;

      if (userWallet) {
        setWalletAddress(userWallet.wallet_address);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet address",
        variant: "destructive",
      });
    }
  };

  const updateWallet = async (newAddress: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('user_wallets')
        .upsert({ 
          user_id: user.id, 
          wallet_address: newAddress 
        }, {
          onConflict: 'user_id'
        });

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
