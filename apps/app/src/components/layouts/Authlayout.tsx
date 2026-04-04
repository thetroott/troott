import { TroottLogo } from "../shared/app/troot-logo"
import { Copyright } from "../ui/copyright"
import type { IAuthLayout } from "@/utils/interfaces.util"


export function AuthLayout(data: IAuthLayout) {

    const {
        children,
        title,
        description,
        showLogo = true,
        showCopyright = true,
        maxWidth = "xs",
        backgroundImage = "/placeholder.svg",
        className = "",
        hideHeaderOnSuccess = false,
      } = data

  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }

  return (
    <div className={`grid min-h-svh lg:grid-cols-2 ${className}`}>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {showLogo && (
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <TroottLogo className="size-4" />
              </div>
              troott
            </a>
          </div>
        )}

        <div className="flex flex-1 items-center justify-center">
          <div className={`w-full ${maxWidthClasses[maxWidth]}`}>
            {(title || description) && !hideHeaderOnSuccess  && (
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
                {description && <p className="text-balance text-sm text-muted-foreground">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </div>

        {showCopyright && (
          <div className="flex justify-start">
            <Copyright year={2025} company="troott" />
          </div>
        )}
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src={backgroundImage || "/placeholder.svg"}
          alt="Authentication background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
