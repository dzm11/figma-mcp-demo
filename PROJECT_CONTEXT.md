# Kontekst projektu: figma-mcp-demo

## 1) Cel projektu
Projekt to design-system demo oparty o React + TypeScript + Vite + Storybook.
Komponenty są implementowane na podstawie Figma i mapowane przez Figma Code Connect.

## 2) Stack i narzędzia
- React 19
- TypeScript 5
- Vite 7
- Storybook 10 (react-vite)
- ESLint 9
- Figma Code Connect (@figma/code-connect)

## 3) Struktura repo
- src/components: implementacje komponentów (TSX + types + CSS Modules)
- src/stories: storybook stories dla komponentów
- src/figma: mapowania Code Connect do node-ów Figma
- src/styles/tokens.css: tokeny design systemu (kolory, spacing, radius, typography, shadows)
- src/assets: pliki SVG/PNG używane przez komponenty
- .github/instructions/react-components.instructions.md: zasady implementacji komponentów

## 4) Zaimplementowane komponenty
1. Button
- Rozmiary: l, m, s
- Typy: primary, outlined, secondary, tertiary
- Stany: default, disabled, loading, critical
- Wspiera ikonę, disclosure i onClick

2. Checkbox
- checked/defaultChecked, indeterminate
- stany critical i disabled
- label, errorMessage, onChange
- używa assetów tick.svg i dash.svg

3. Avatar
- Rozmiary: xs, s, m, l, xl
- Typy: initials, inverse, company, image
- Stany: default, hover
- Opcjonalny text i subtext
- Obsługa imageSrc i companyLogoSrc

4. Label
- Kolory: red, gray, yellow, green, black, orange, blue, purple, teal
- Tryby: isStrong true/false
- Typ: default lub icon

5. InlineError
- Prosty komponent komunikatu błędu (message)

6. Tooltip
- Arrow: top lub bottom
- Tone: default lub inverse
- title, description, showDescription

7. DemoCard (kompozycja)
- Składa się z Label + Tooltip + Avatar + Button
- Po kliknięciu Reset przechodzi tymczasowo w loading
- Ikona resetu jest ładowana z pliku src/assets/reset.svg
- Czas resetu konfigurowany props resetDelayMs (domyślnie 2200)

## 5) Storybook
W projekcie są story dla każdego komponentu:
- Components/Button
- Components/Checkbox
- Components/Avatar
- Components/Label
- Components/InlineError
- Components/Tooltip
- Components/DemoCard

## 6) Mapowania Figma Code Connect
Pliki mapowań są w src/figma:
- Button.figma.tsx
- Checkbox.figma.tsx
- Avatar.figma.tsx
- Label.figma.tsx
- InlineError.figma.tsx
- Tooltip.figma.tsx
- DemoCard.figma.tsx

Używany plik Figma (file key): H3scHHO8gzcKecmO2Sa9aN.
W mapowaniach są konkretne node-id dla każdego komponentu.

## 7) Tokeny i stylowanie
- Stylowanie przez CSS Modules
- Wartości designowe przez CSS variables z src/styles/tokens.css
- Zasada: brak hardcoded wartości kolorów/spacing/radius/typography tam, gdzie istnieją tokeny

## 8) Assety
W src/assets obecnie używane między innymi:
- Company Logo.svg
- reset.svg
- tick.svg
- dash.svg
- dodatkowe SVG/PNG wyeksportowane z Figma

## 9) Komendy (package scripts)
- npm run dev: uruchamia Vite
- npm run build: buduje aplikację
- npm run lint: lint
- npm run storybook: uruchamia Storybook
- npm run build-storybook: buduje statyczny Storybook
- npm run figma:publish: publikuje Code Connect (z .env.local)
- npm run figma:publish:dry: dry run publish

## 10) Gotowy kontekst do wklejenia do innego toola
Skopiuj sekcję poniżej:

Jestem w projekcie figma-mcp-demo (React 19 + TypeScript + Vite + Storybook 10). Mam już zaimplementowane komponenty Button, Checkbox, Avatar, Label, InlineError, Tooltip oraz kompozycję DemoCard. Każdy komponent ma story w src/stories i mapowanie Figma Code Connect w src/figma. Stylowanie jest w CSS Modules, a wartości designowe pochodzą z src/styles/tokens.css. Assety SVG/PNG są w src/assets, w tym reset.svg używany przez ikonę resetu w DemoCard. Potrzebuję kontynuować prace bez duplikowania istniejących komponentów i zgodnie z obecną strukturą repo.

## 11) Zasady dla kolejnych zmian
- Najpierw sprawdzaj, czy komponent już istnieje, zanim utworzysz nowy
- Zachowuj podział: components / stories / figma
- Utrzymuj zgodność z tokenami i CSS Modules
- Dla zmian z Figma zachowuj 1:1 z node i screenshotem
