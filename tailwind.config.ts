import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Cores do design do cardápio
        'red-strong': '#E10600', // Vermelho forte (fundo dominante)
        'red-dark': '#700F12', // Vermelho escuro (variações/bordas)
        'yellow-gold': '#F2C200', // Amarelo dourado (logo / destaques)
        'white': '#FFFFFF', // Branco (textos e fundos dos cards)
        'black-dark': '#1A1A1A', // Preto / cinza escuro (textos)
        // Cores antigas mantidas para compatibilidade
        'red-primary': '#E10600',
        'red-secondary': '#700F12',
        'yellow-mustard': '#F2C200',
        'brown-dark': '#1A1A1A',
        'bg-main': '#E10600', // Fundo geral: vermelho
        'bg-card': '#FFFFFF', // Cards dos produtos: branco
      },
    },
  },
  plugins: [],
}
export default config


