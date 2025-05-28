// import * as React from "react"

// import { cn } from "@/lib/utils"

// const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
//   ({ className, type, ...props }, ref) => {
//     return (
//       <input
//         type={type}
//         className={cn(
//           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//     )
//   }
// )
// Input.displayName = "Input"

// export { Input }

import * as React from "react"
import { cn } from "@/lib/utils" // Assuming cn is correctly imported and works as expected

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      // The new wrapper div for the gradient effect
      <div className="relative p-[2px] rounded-md overflow-hidden group">
        {/* Gradient border layer - positioned absolutely within the wrapper */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 transform transition-all duration-300
                     group-hover:scale-105 group-focus-within:scale-105"
        ></div>

        {/* The actual input element */}
        <input
          type={type}
          className={cn(
            "relative z-10 w-full rounded-md px-3 py-2 text-base md:text-sm", // Base styles for the inner input
            "h-10 bg-background text-foreground placeholder:text-gray-300", // Existing background, text, placeholder
            "focus:outline-none focus:ring-0 focus:border-transparent", // Crucial for overriding default focus styles
            // We remove the default border from this input as the gradient div acts as the border
            // "border border-input" - REMOVE THIS from here
            // "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground", // File input specific (keep if needed, but not directly related to this input's border)
            // "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Overridden by focus:ring-0, focus:outline-none
            "disabled:cursor-not-allowed disabled:opacity-50", // Existing disabled styles
            className // Allows users to pass additional classes
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }