"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Building2, Calendar, FileText, Menu, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface MenuItem {
  id: string
  title: string
  url: string
  icon: React.ElementType
}

interface MedicalMenuProps {
  className?: string
  items?: MenuItem[]
  logo?: {
    text: string
    url: string
  }
  user?: {
    name: string
    onProfileClick?: () => void
  }
  setCurrentView?: (view: string) => void
}

const defaultItems: MenuItem[] = [
  { id: "inicio", title: "Início", url: "/", icon: Home },
  { id: "hospitais", title: "Hospitais", url: "/hospitais", icon: Building2 },
  { id: "plantoes", title: "Plantões", url: "/plantoes", icon: Calendar },
  { id: "relatorios", title: "Relatórios", url: "/relatorios", icon: FileText },
]

const defaultLogo = {
  text: "MedSystem",
  url: "/"
}

export function MedicalMenu({ 
  className, 
  items = defaultItems, 
  logo = defaultLogo,
  user,
  setCurrentView
}: MedicalMenuProps) {
  const [activeItem, setActiveItem] = React.useState(items[0]?.id || "inicio")
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId)
    if (setCurrentView) setCurrentView(itemId)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn(
        "hidden md:flex items-center justify-between w-full max-w-6xl mx-auto px-5 py-3.5",
        "bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg",
        className
      )}>
        {/* Menu Items */}
        <div className="flex items-center gap-1.5">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <motion.a
                key={item.id}
                href={undefined}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-300",
                  "text-xs font-medium",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg border border-primary/30"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </motion.a>
            )
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header removido */}
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-background/95 backdrop-blur-md border-t border-border/50 px-3 py-1.5">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id

              return (
                <motion.a
                  key={item.id}
                  href={undefined}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 p-1.5 rounded-md transition-all duration-300",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="bottomActiveIndicator"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.a>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
} 