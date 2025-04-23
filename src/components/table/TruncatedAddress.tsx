
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TruncatedAddressProps {
  address: string;
}

export const TruncatedAddress = ({ address }: TruncatedAddressProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied to clipboard",
      description: "The address has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm truncate">{address}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={handleCopy}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

