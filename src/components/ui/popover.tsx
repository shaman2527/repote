import { cn } from "@/lib/utils"
import { Popover as PopoverPrimitive } from "radix-ui"

export function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Popover.Root>) {
  return <PopoverPrimitive.Popover.Root data-slot="popover" {...props} />
}

export function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Popover.Trigger>) {
  return <PopoverPrimitive.Popover.Trigger data-slot="popover-trigger" {...props} />
}

export function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Popover.Content>) {
  return (
    <PopoverPrimitive.Popover.Portal>
      <PopoverPrimitive.Popover.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Popover.Portal>
  )
}
