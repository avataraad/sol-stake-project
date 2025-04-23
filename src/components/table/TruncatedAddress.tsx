
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TruncatedAddressProps {
  address: string;
}

export const TruncatedAddress = ({ address }: TruncatedAddressProps) => {
  const { toast } = useToast();
  const start = address.slice(0, 5);
  const middle = address.slice(5, -5);
  const end = address.slice(-5);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied to clipboard",
      description: "The address has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="font-mono text-sm leading-tight break-all">
        <span>{start}</span>
        <span className="text-muted-foreground">{middle}</span>
        <span>{end}</span>
      </div>
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

