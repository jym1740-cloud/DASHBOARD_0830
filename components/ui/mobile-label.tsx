import * as React from "react"
import { cn } from "@/lib/utils"

const MobileLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      // 모바일에서 더 큰 라벨, 더 나은 가독성
      "text-sm font-medium text-gray-700 mb-2 block sm:text-sm sm:mb-1",
      // 모바일에서 더 많은 여백
      "leading-relaxed sm:leading-normal",
      className
    )}
    {...props}
  />
))
MobileLabel.displayName = "MobileLabel"

export { MobileLabel }
