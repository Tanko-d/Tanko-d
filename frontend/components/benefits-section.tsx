import { 
  Percent, 
  Zap, 
  MapPin, 
  BarChart3, 
  CreditCard, 
  Users,
  CheckCircle2
} from "lucide-react"

const benefits = [
  {
    icon: Percent,
    title: "Lowest Fees",
    description: "We offer the most competitive fees in the market. Save up to 60% compared to other e-wallet providers.",
    features: [
      "Only 0.5% per transaction",
      "No hidden costs",
      "Guaranteed savings"
    ]
  },
  {
    icon: Zap,
    title: "Ultra-Fast Onboarding",
    description: "Complete your registration in under 5 minutes. Streamlined process with no unnecessary paperwork or long wait times.",
    features: [
      "Sign up in 5 minutes",
      "Automatic verification",
      "Immediate activation"
    ]
  },
  {
    icon: MapPin,
    title: "Station Network",
    description: "Access over 5,000 service stations nationwide. Find the nearest station with our interactive map.",
    features: [
      "Nationwide coverage",
      "Real-time map",
      "Exclusive benefits"
    ]
  },
  {
    icon: BarChart3,
    title: "Full Spend Control",
    description: "Monitor every transaction with detailed reports. View consumption by unit, location, and time period.",
    features: [
      "Real-time reports",
      "Per-unit analytics",
      "Data export"
    ]
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "State-of-the-art encryption technology. Your transactions are protected by the highest security standards.",
    features: [
      "SSL encryption",
      "Fraud protection",
      "Secure transactions"
    ]
  },
  {
    icon: Users,
    title: "Fleet Management",
    description: "Manage multiple units and drivers from a single panel. Centralized control for companies of any size.",
    features: [
      "Multiple users",
      "Per-unit limits",
      "Custom alerts"
    ]
  }
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Benefits
          </span>
          <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            What sets us apart
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Built for transport companies and fleets that want to optimize fuel spending with the best technology and service.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              
              <p className="mb-6 text-muted-foreground">
                {benefit.description}
              </p>
              
              <ul className="space-y-2">
                {benefit.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
