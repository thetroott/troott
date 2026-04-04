import * as React from "react";
import { useId } from "react";
import {
  SidebarInput,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  ArrowUpRightIcon,
  CircleFadingPlusIcon,
  FileInputIcon,
  FolderPlusIcon,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";



interface ISearchForm {
  navItems?: Array<{
    title: string
    icon: React.ComponentType<{ className?: string }>
  }>
  onNavigate?: (item: string) => void
  collapsed?: boolean;
  props?: React.ComponentProps<"form">;
}
export function SearchForm(data: ISearchForm) {
  const { ...props } = data;
  const [open, setOpen] = React.useState(false);
  const { state } = useSidebar();
  const id = useId();
  

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const isCollapsed = state === "collapsed";

  return (
    <>
    <div {...props}>
      <SidebarGroup>
        <SidebarGroupContent className="px-3 w-full md:px-0">
          <SidebarMenu>
            <SidebarMenuItem>
              {isCollapsed ? (
                <SidebarMenuButton
                  tooltip={{
                    children: "Search (⌘K)",
                    hidden: false,
                  }}
                  onClick={() => setOpen(true)}
                  type="button"
                  data-active={true}
                  className="border border-neutral-600"
                >
                  <Search className="size-4" />
                  <span>Search</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  onClick={() => setOpen(true)}
                  type="button"
                  data-active={true}
                  aria-label="Search"
                  className="ps-0 pe-0 h-9 w-full flex items-center justify-start gap-2 rounded-md hover:bg-muted data-[active=true]:bg-muted"
                >
                  <div className="relative w-full ">
                    <SidebarInput
                      id={id}
                      className="ps-9 pe-9 cursor-pointer dark:placeholder:font-light dark:placeholder:text-white"
                      aria-label="Search"
                      placeholder="Quick Search"
                      data-active={true}
                      readOnly
                      
                    />
                    <div className="pointer-events-none  absolute inset-y-0 start-0 flex items-center justify-center ps-2  text-neutral-800  dark:text-neutral-300 peer-disabled:opacity-50">
                      <Search size={16} aria-hidden="true" />
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-1  text-neutral-900  dark:text-neutral-100">
                      <kbd className="inline-flex p-3 size-5 max-h-full items-center justify-center rounded-md bg-input font-[inherit] text-[0.825rem] font-medium text-neutral-900  dark:text-neutral-100">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>

        
        </SidebarGroupContent>
      </SidebarGroup>
    </div>

<CommandDialog open={open} onOpenChange={setOpen}>
<CommandInput placeholder="Type a command or search..." />
<CommandList>
  <CommandEmpty>No results found.</CommandEmpty>
  <CommandGroup heading="Quick start">
    <CommandItem>
      <FolderPlusIcon
        size={16}
        className="opacity-60"
        aria-hidden="true"
      />
      <span>New folder</span>
      <CommandShortcut className="justify-center">
        ⌘N
      </CommandShortcut>
    </CommandItem>
    <CommandItem>
      <FileInputIcon
        size={16}
        className="opacity-60"
        aria-hidden="true"
      />
      <span>Import document</span>
      <CommandShortcut className="justify-center">
        ⌘I
      </CommandShortcut>
    </CommandItem>
    <CommandItem>
      <CircleFadingPlusIcon
        size={16}
        className="opacity-60"
        aria-hidden="true"
      />
      <span>Add block</span>
      <CommandShortcut className="justify-center">
        ⌘B
      </CommandShortcut>
    </CommandItem>
  </CommandGroup>
  <CommandSeparator />
  <CommandGroup heading="Navigation">
    <CommandItem>
      <ArrowUpRightIcon
        size={16}
        className="opacity-60"
        aria-hidden="true"
      />
      <span>Go to dashboard</span>
    </CommandItem>
    <CommandItem>
      <ArrowUpRightIcon
        size={16}
        className="opacity-60"
        aria-hidden="true"
      />
      <span>Go to apps</span>
    </CommandItem>
    <CommandItem>
      <ArrowUpRightIcon
        size={16}
        className="opacity-60"
        aria-hidden="true"
      />
      <span>Go to connections</span>
    </CommandItem>
  </CommandGroup>
</CommandList>
</CommandDialog>
</>
  );
}
