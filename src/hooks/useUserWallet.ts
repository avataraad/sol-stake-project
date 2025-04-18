
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useUserWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status when the component mounts
    checkAuthStatus();
    fetchUserWallet();
  }, []);

  const checkAuthStatus = async () => {
    const { data } = await supabase.auth.getSession();
    setIsAuthenticated(!!data.session);
  };

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
      // First check if we have a user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        // If no authenticated user, try inserting without user_id
        const { error } = await supabase
          .from('user_wallets')
          .upsert({ 
            wallet_address: newAddress 
          });

        if (error) throw error;
      } else {
        // If we have a user, include the user_id
        const { error } = await supabase
          .from('user_wallets')
          .upsert({ 
            user_id: user.id, 
            wallet_address: newAddress 
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
      }

      setWalletAddress(newAddress);
      toast({
        title: "Success",
        description: "Wallet address updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating wallet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    walletAddress,
    isLoading,
    isAuthenticated,
    updateWallet
  };
};
