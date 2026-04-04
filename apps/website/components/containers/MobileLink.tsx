import { RiArrowRightLine } from "@remixicon/react"
import Link from "next/link"

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex w-full items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-teal-50 dark:hover:bg-teal-900/20"
    >
      <span className="text-base font-medium text-gray-800 dark:text-gray-100">
        {children}
      </span>

      <span
        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-teal-300 dark:border-teal-600 
        transition-all duration-300 ease-in-out 
        group-hover:bg-teal-500 group-hover:dark:bg-background group-hover:scale-105"
      >
        <RiArrowRightLine
          className="size-5 text-teal-700 dark:text-teal-300 transition-transform duration-300 ease-in-out 
          group-hover:rotate-[-45deg] group-hover:text-white"
        />
      </span>
    </Link>
  )
}

export default MobileLink
