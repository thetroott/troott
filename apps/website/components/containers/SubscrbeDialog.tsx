import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MailIcon } from "lucide-react"

interface ISubscribeDialog {
    open: boolean
    onOpenChange: (open: boolean) => void
}
const SubscribeDialog = (data: ISubscribeDialog) => {


    const { open, onOpenChange } = data
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-md">
        <div className="flex justify-center">
          <MailIcon size={40} className="text-primary" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-center">Subscribe to our newsletter</DialogTitle>
          <DialogDescription className="text-center">
            Stay updated with our latest news
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input placeholder="First name" />
          <Input placeholder="Email" type="email" />
          <Button className="w-full">Subscribe</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubscribeDialog
