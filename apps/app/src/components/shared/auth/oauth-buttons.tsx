import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useAuthStore } from "@/store/auth.store";


interface OAuthButtonsProps {
  className?: string;
  formType: "login" | "register"; // Add this prop
}

export function OAuthButtons({ className, formType }: OAuthButtonsProps) {
  const { setLoading } = useAuthStore();
  const actionText = formType === "login" ? "with" : "with";

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <>
      <div className={`flex gap-2 mb-3 flex-col sm:flex-row ${className}`}>
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("google")}
          className="w-full h-11 border-border hover:bg-muted/50 transition-colors"
        >
          <Icons.google className="mr-2 h-4 w-4" />
          {actionText} Google 
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("github")}
          className="w-full h-11 border-border hover:bg-muted/50 transition-colors"
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          {actionText} GitHub
        </Button>
      </div>

      {/* Separator */}
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </>
  );
}