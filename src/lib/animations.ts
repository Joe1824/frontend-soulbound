// Animation variants and utilities for micro-interactions

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
}

// CSS class utilities for micro-interactions
export const microInteractions = {
  // Button interactions
  button: "transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-lg",
  buttonPrimary: "transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-blue-500/25",
  buttonSecondary: "transition-all duration-200 ease-out hover:scale-102 active:scale-98 hover:shadow-md",
  
  // Card interactions
  card: "transition-all duration-300 ease-out hover:scale-102 hover:shadow-xl hover:shadow-blue-500/10",
  cardInteractive: "transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50 cursor-pointer",
  
  // Input interactions
  input: "transition-all duration-200 ease-out focus:scale-102 focus:shadow-lg focus:shadow-blue-500/10",
  inputFile: "transition-all duration-300 ease-out hover:scale-102 hover:border-blue-400/50 hover:bg-blue-50/5",
  
  // Progress indicators
  progressBar: "transition-all duration-500 ease-out",
  progressStep: "transition-all duration-300 ease-out hover:scale-110",
  
  // Status indicators
  statusSuccess: "animate-pulse-slow bg-green-500/20 text-green-400",
  statusError: "animate-pulse-slow bg-red-500/20 text-red-400",
  statusLoading: "animate-pulse bg-blue-500/20 text-blue-400",
  
  // Floating animations
  float: "animate-bounce-subtle",
  glow: "animate-glow",
  
  // Loading states
  shimmer: "animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent",
}

// Custom animation keyframes (to be added to CSS)
export const keyframes = `
  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  @keyframes slide-in-right {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-out-right {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
  
  .animate-slide-out-right {
    animation: slide-out-right 0.3s ease-out;
  }
`

// Utility functions for dynamic animations
export function getStaggerDelay(index: number, baseDelay: number = 100): string {
  return `${index * baseDelay}ms`
}

export function getRandomFloat(min: number = 0.5, max: number = 1.5): number {
  return Math.random() * (max - min) + min
}

// Success celebration animation
export function triggerSuccessAnimation(element: HTMLElement | null) {
  if (!element) return
  
  element.classList.add('animate-bounce-subtle', 'animate-glow')
  
  setTimeout(() => {
    element.classList.remove('animate-bounce-subtle', 'animate-glow')
  }, 2000)
}

// Error shake animation
export function triggerErrorAnimation(element: HTMLElement | null) {
  if (!element) return
  
  element.style.animation = 'none'
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  element.offsetHeight // Trigger reflow
  element.style.animation = 'shake 0.5s ease-in-out'
  
  setTimeout(() => {
    element.style.animation = ''
  }, 500)
}