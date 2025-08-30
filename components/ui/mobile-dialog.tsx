import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const MobileDialog = DialogPrimitive.Root
const MobileDialogTrigger = DialogPrimitive.Trigger
const MobileDialogPortal = DialogPrimitive.Portal
const MobileDialogClose = DialogPrimitive.Close

const MobileDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
MobileDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showBackButton?: boolean;
    onBack?: () => void;
  }
>(({ className, children, showBackButton = false, onBack, ...props }, ref) => (
  <MobileDialogPortal>
    <MobileDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // 모바일: 전체 화면 최적화, 데스크톱: 기존 스타일
        "fixed z-50 bg-background shadow-lg duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // 모바일 전체 화면 + 안전 영역 고려
        "inset-0 sm:inset-auto",
        "flex flex-col sm:block", // 모바일에서 flex 레이아웃
        "sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
        "sm:max-w-lg sm:rounded-lg sm:border",
        "data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
        // 안전 영역 패딩
        "pt-safe-area-inset-top pb-safe-area-inset-bottom sm:pt-0 sm:pb-0",
        className
      )}
      {...props}
    >
      {/* 모바일 헤더 - 고정 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 sm:hidden">
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-11" />
        )}
        
        <DialogPrimitive.Close className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      {/* 콘텐츠 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto mobile-dialog-scroll sm:overflow-visible">
        {children}
      </div>

      {/* 데스크톱 닫기 버튼 */}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hidden sm:block">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </MobileDialogPortal>
))
MobileDialogContent.displayName = DialogPrimitive.Content.displayName

const MobileDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // 모바일 최적화된 헤더 패딩
      "px-4 py-4 sm:px-6 sm:py-6",
      // 모바일에서 더 컴팩트한 스타일
      "border-b border-gray-100 sm:border-0",
      className
    )}
    {...props}
  />
)
MobileDialogHeader.displayName = "MobileDialogHeader"

const MobileDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // 모바일 최적화된 푸터
      "sticky bottom-0 bg-white border-t border-gray-200",
      "flex flex-col gap-3 p-4 sm:flex-row sm:justify-end sm:gap-2",
      "sm:bg-transparent sm:border-0 sm:p-6 sm:static",
      // 안전 영역 고려
      "pb-safe-area-inset-bottom sm:pb-0",
      className
    )}
    {...props}
  />
)
MobileDialogFooter.displayName = "MobileDialogFooter"

const MobileDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      // 모바일에서 더 큰 제목, 데스크톱에서 적당한 크기
      "text-lg font-semibold leading-tight tracking-tight sm:text-lg",
      "text-gray-900 sm:text-gray-900",
      // 모바일에서 중앙 정렬 고려
      "text-center sm:text-left",
      className
    )}
    {...props}
  />
))
MobileDialogTitle.displayName = DialogPrimitive.Title.displayName

const MobileDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-2", className)}
    {...props}
  />
))
MobileDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  MobileDialog,
  MobileDialogPortal,
  MobileDialogOverlay,
  MobileDialogClose,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
  MobileDialogDescription,
}
