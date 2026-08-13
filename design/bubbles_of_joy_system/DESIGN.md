---
name: Bubbles of Joy System
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  headline-xl:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-md:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Quicksand
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The brand personality for "Les Bulles de Joie" is a harmonious blend of **premium educational excellence** and **childlike wonder**. The design system evokes a sense of safety, vibrancy, and modern professionalism. It targets discerning parents who value both high academic standards and a nurturing, creative environment.

The visual style is a **Modern-Playful** hybrid. It utilizes expansive white space and a sophisticated neutral foundation to convey a "premium" feel, while injecting energy through "bubble" inspired geometry, vibrant accents, and soft, tactile UI elements. The interface should feel breathable and organized, never cluttered, allowing high-quality photography of happy, engaged children to take center stage.

## Colors

This design system utilizes a palette derived directly from the school's identity to ensure brand consistency and emotional resonance.

- **Primary Colors:** The Pink (#E6338D) and Lime Green (#84BD00) are used for key call-to-actions, primary navigation highlights, and major brand moments.
- **Secondary Colors:** The Soft Blue (#5BC2E7) and Yellow (#FFD700) act as supportive accents for categorizing different school levels (e.g., Blue for Crèche, Yellow for Maternelle) or for decorative "bubble" elements.
- **Backgrounds:** A heavy reliance on pure White (#FFFFFF) provides the premium, clean gallery-like feel. Very light Gray (#F9FAFB) is used for subtle section differentiation.
- **Hierarchy:** Use the primary pink for the most important actions. Use the lime green for success states or growth-related information.

## Typography

The typography strategy balances approachability with clarity. 

**Quicksand** is the display face, chosen for its rounded terminals that echo the "bubbles" in the logo. It should be used for all headings to maintain a friendly, welcoming tone.

**Inter** provides a highly legible, neutral counterpoint for body copy and administrative data. It ensures that important school information, schedules, and blogs are easy to digest.

**Implementation Notes:**
- Headlines should use "Sentence case" to feel more conversational.
- Maintain generous line-heights in body copy to enhance the "airy" and "premium" aesthetic.
- For mobile, scale down the largest headlines significantly to prevent awkward word breaks while maintaining the bold, rounded character.

## Layout & Spacing

The layout philosophy is built on a **Fluid Grid** with generous padding to emphasize the "clean" and "premium" nature of the school.

- **Grid:** A 12-column grid system is used for desktop. 
- **Sectioning:** Large vertical gaps (120px on desktop) are used between major content sections to prevent visual fatigue and highlight high-quality imagery.
- **Rhythm:** All spacing (padding/margins) should be multiples of the 8px base unit.
- **Photography:** Images should often break the grid or use asymmetric layouts to feel dynamic and playful, rather than rigid.

## Elevation & Depth

Visual hierarchy is achieved through **Soft Tonal Layers** and **Ambient Shadows**.

- **Shadows:** Avoid harsh, black shadows. Use very diffused, low-opacity shadows with a subtle hint of the primary pink or blue in the shadow color (e.g., `rgba(230, 51, 141, 0.08)`).
- **Depth:** Surfaces are generally flat or very slightly elevated. The "Bubble" effect is created through overlapping elements rather than heavy 3D effects.
- **Glassmorphism:** Use subtle backdrop blurs (10px - 15px) for navigation bars or floating image captions to maintain the "premium" feel while adding a layer of sophisticated transparency.

## Shapes

The shape language is dominated by high-radius curves, reflecting the "bubbles" of joy.

- **Core Elements:** Buttons, input fields, and small cards use a **Pill-shaped (Level 3)** roundedness (minimum 24px) to ensure a soft, safe feel for a child-focused brand.
- **Containers:** Large sections or hero image containers should use `rounded-xl` (48px+) to create a friendly "enclosure" for content.
- **Decorative:** Floating circles (bubbles) of varying sizes and brand colors should be used as background decorations to add depth and playfulness without interfering with legibility.

## Components

### Buttons
- **Primary:** Pill-shaped, Primary Pink background, White text. High-contrast and energetic.
- **Secondary:** Pill-shaped, Primary Lime Green background or Soft Blue.
- **Ghost:** Primary Pink border (2px) with transparent background for less critical actions.

### Cards
- **Style:** Pure white background with a `rounded-xl` corner radius.
- **Shadow:** Use the "Ambient Shadow" (diffused and tinted) to make cards "float" off the light gray background.
- **Content:** Cards should lead with high-quality photography, with text nested in generous internal padding (min 32px).

### Input Fields
- **Style:** Soft gray background (#F3F4F6) with a subtle internal shadow or 1px stroke.
- **Corners:** Fully rounded (pill) style to match buttons.

### Chips & Badges
- **Usage:** Used for school categories (Crèche, Maternelle, Primaire).
- **Style:** Small, pill-shaped with low-opacity backgrounds of the secondary colors (e.g., Light Blue background with Dark Blue text).

### Icons
- **Style:** Line icons with rounded caps and joins. Occasionally use "Duotone" styles where the secondary element of the icon is a solid brand color circle (a bubble).

### Decorative Bubbles
- **Usage:** Floating, semi-transparent circles of brand colors placed behind images or in the corners of sections to reinforce the logo's theme.