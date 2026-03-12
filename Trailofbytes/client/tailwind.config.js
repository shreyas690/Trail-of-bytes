export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(220 20% 8%)",
        foreground: "hsl(180 100% 85%)",
        primary: "hsl(180 100% 50%)",
        card: "hsl(220 25% 12%)",
        border: "hsl(180 100% 50%)",
        "muted-foreground": "hsl(180 50% 60%)"
      },
      boxShadow: {
        neon: "0 0 20px hsl(180 100% 50% / 0.25)",
        glow: "0 0 40px hsl(180 100% 50% / 0.15)",
        "neon-soft": "0 0 10px hsl(180 100% 50% / 0.15)"
      },
      backgroundImage: {
        "gradient-cyber": "linear-gradient(135deg, hsl(220 25% 12%), hsl(220 25% 8%))",
        "gradient-neon": "linear-gradient(90deg, hsl(180 100% 50%), hsl(180 100% 60%))"
      },
      animation: {
        "glow-pulse": "glowPulse 2s infinite",
        "neon-flicker": "neonFlicker 1.5s infinite",
        "scan-line": "scanLine 3s infinite",
        "float": "float 4s ease-in-out infinite",
        "slide-in": "slideIn 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards"
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px hsl(180 100% 50% / 0.3)" },
          "50%": { boxShadow: "0 0 20px hsl(180 100% 50% / 0.6)" }
        },
        neonFlicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" }
        },
        scanLine: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" }
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" }
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      transitionProperty: {
        smooth: "all"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  plugins: []
};
