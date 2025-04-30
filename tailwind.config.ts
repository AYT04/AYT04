import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
       typography: ({ theme }: { theme: any }) => ({ // Added typography configuration
          DEFAULT: {
            css: {
              '--tw-prose-body': theme('colors.foreground'),
              '--tw-prose-headings': theme('colors.primary.DEFAULT'),
              '--tw-prose-lead': theme('colors.muted.foreground'),
              '--tw-prose-links': theme('colors.accent.DEFAULT'),
              '--tw-prose-bold': theme('colors.foreground'),
              '--tw-prose-counters': theme('colors.muted.foreground'),
              '--tw-prose-bullets': theme('colors.muted.foreground'),
              '--tw-prose-hr': theme('colors.border'),
              '--tw-prose-quotes': theme('colors.foreground'),
              '--tw-prose-quote-borders': theme('colors.accent.DEFAULT'),
              '--tw-prose-captions': theme('colors.muted.foreground'),
              '--tw-prose-code': theme('colors.primary.DEFAULT'), // Code block text
              '--tw-prose-pre-code': theme('colors.primary.foreground'), // Code inside pre
              '--tw-prose-pre-bg': theme('colors.primary.DEFAULT'), // Code block background
              '--tw-prose-th-borders': theme('colors.border'),
              '--tw-prose-td-borders': theme('colors.border'),
              '--tw-prose-invert-body': theme('colors.foreground'),
              '--tw-prose-invert-headings': theme('colors.primary.DEFAULT'),
              '--tw-prose-invert-lead': theme('colors.muted.foreground'),
              '--tw-prose-invert-links': theme('colors.accent.DEFAULT'),
              '--tw-prose-invert-bold': theme('colors.foreground'),
              '--tw-prose-invert-counters': theme('colors.muted.foreground'),
              '--tw-prose-invert-bullets': theme('colors.muted.foreground'),
              '--tw-prose-invert-hr': theme('colors.border'),
              '--tw-prose-invert-quotes': theme('colors.foreground'),
              '--tw-prose-invert-quote-borders': theme('colors.accent.DEFAULT'),
              '--tw-prose-invert-captions': theme('colors.muted.foreground'),
              '--tw-prose-invert-code': theme('colors.primary.foreground'), // Dark: Code block text
              '--tw-prose-invert-pre-code': theme('colors.primary.foreground'), // Dark: Code inside pre
              '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)', // Dark: Code block background
              '--tw-prose-invert-th-borders': theme('colors.border'),
              '--tw-prose-invert-td-borders': theme('colors.border'),
              // Add more customizations as needed
              h1: { fontWeight: '700' },
              h2: { fontWeight: '600' },
              h3: { fontWeight: '600' },
            },
          },
        }),
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'), // Added typography plugin
  ],
} satisfies Config;
