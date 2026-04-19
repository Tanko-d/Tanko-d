'use client'

import { useState } from 'react'
import { X, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const VEHICLE_TYPES = [
  { value: 'truck', label: 'Truck / Box Truck' },
  { value: 'tractor', label: 'Tractor / Semi-Trailer' },
  { value: 'van', label: 'Delivery Van' },
  { value: 'pickup', label: 'Pickup Truck' },
  { value: 'bus', label: 'Bus / Coach' },
  { value: 'car', label: 'Passenger Vehicle' },
  { value: 'forklift', label: 'Forklift' },
  { value: 'other', label: 'Other' },
]

const UNIT_USE = [
  { value: 'cold_chain', label: 'Cold Chain / Refrigerated' },
  { value: 'cargo', label: 'General Cargo' },
  { value: 'security', label: 'Security / Patrol' },
  { value: 'school', label: 'School Transport' },
  { value: 'passenger', label: 'Passenger Transport' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'delivery', label: 'Last Mile Delivery' },
  { value: 'other', label: 'Other' },
]

interface ScheduleModalProps {
  children: React.ReactNode
}

export function ScheduleModal({ children }: ScheduleModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    fleetOwnerName: '',
    companyName: '',
    vehicleType: '',
    unitUse: '',
    monthlyConsumption: '',
    comments: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Schedule demo request:', formData)
    setIsSubmitting(false)
    setIsSubmitted(true)

    setTimeout(() => {
      setOpen(false)
      setIsSubmitted(false)
      setFormData({
        fleetOwnerName: '',
        companyName: '',
        vehicleType: '',
        unitUse: '',
        monthlyConsumption: '',
        comments: '',
      })
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule a Demo
          </DialogTitle>
          <DialogDescription>
            Book a personalized demo of TANKO for your fleet. Our team will contact you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground">
              Thank you for your interest. Our team will contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fleetOwnerName">Fleet Owner Name *</Label>
              <Input
                id="fleetOwnerName"
                placeholder="John Doe"
                value={formData.fleetOwnerName}
                onChange={(e) =>
                  setFormData({ ...formData, fleetOwnerName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Legal Name *</Label>
              <Input
                id="companyName"
                placeholder="Transportes Ejemplo, S.A. de C.V."
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicleType: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitUse">Specific Use *</Label>
                <Select
                  value={formData.unitUse}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unitUse: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select use" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_USE.map((use) => (
                      <SelectItem key={use.value} value={use.value}>
                        {use.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyConsumption">Approx. Monthly Fuel Consumption (MXN) *</Label>
              <Input
                id="monthlyConsumption"
                type="number"
                placeholder="50000"
                min="1000"
                value={formData.monthlyConsumption}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyConsumption: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Any specific requirements or questions..."
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Schedule Demo'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}