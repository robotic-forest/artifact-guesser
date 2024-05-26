import { Global, css } from '@emotion/react'
import { useRouter } from 'next/router'
import { complement, darken, lighten, desaturate } from 'polished'

export const themeCSS = theme => css`
  --backgroundColor: ${theme.backgroundColor};

  --backgroundColorBarelyDark: ${darken(0.03, theme.backgroundColor)};
  --backgroundColorSlightlyDark: ${darken(0.07, theme.backgroundColor)};
  --backgroundColorSliightlyDark: ${darken(0.05, theme.backgroundColor)};
  --backgroundColorDark: ${darken(0.1, theme.backgroundColor)};
  --backgroundColorVeryDark: ${darken(0.3, theme.backgroundColor)};

  --backgroundColorBarelyLight: ${lighten(0.04, theme.backgroundColor)};
  --backgroundColorSlightlyLight: ${lighten(0.06, theme.backgroundColor)};
  --backgroundColorLight: ${lighten(0.1, theme.backgroundColor)};
  --backgroundColorLight2: ${lighten(0.2, theme.backgroundColor)};

  --backgroundKindaLowOpacity: ${theme.backgroundColor}dd;
  --backgroundLowOpacity: ${theme.backgroundColor}aa;
  --backgroundVeryLowOpacity: ${theme.backgroundColor}77;

  --primaryColor: ${theme.primaryColor};
  --primaryColorDark: ${darken(0.1, theme.primaryColor)};
  --primaryColorVeryDark: ${darken(0.3, theme.primaryColor)};
  --primaryColorSlightlyDark: ${darken(0.03, theme.primaryColor)};
  --primaryLowOpacity: ${`${theme.primaryColor}77`};
  --primaryVeryLowOpacity: ${`${theme.primaryColor}33`};
  --primaryComplement: ${complement(theme.primaryColor)};
  --primaryShadow: ${desaturate(0.2, darken(0.1, theme.primaryColor))};
  --primaryColorLight: ${lighten(0.1, theme.primaryColor)};
  --primaryColorVeryLight: ${lighten(0.2, theme.primaryColor)};
  --primaryColorBlinding: ${lighten(0.3, theme.primaryColor)};

  --textColor: ${theme.textColor};
  --textLowOpacity: ${`${theme.textColor}77`};
  --textKindaLowOpacity: ${`${theme.textColor}55`};
  --textVeryLowOpacity: ${`${theme.textColor}33`};
  --textVeryLowOpacity27: ${`${theme.textColor}27`};
  --textSuperLowOpacity: ${`${theme.textColor}11`};
  --ghostText: ${`${theme.textColor}07`};
  --whiffOfText: ${`${theme.textColor}04`};
  --textComplement: ${complement(theme.textColor)};

  /* Global Other Vars */
  --br: ${theme.borderRadius}px;
  --brr: ${theme.borderRadiusRound}px;
  --fs: ${theme.fontSize}px;
`

export const GlobalStyles = ({ theme }) => {
  const router = useRouter()

  const isGame = router.pathname === '/'

  return <Global styles={css`
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
      -webkit-text-size-adjust: 100%;
    }

    body, html {
      /* Global Color Vars */
      ${themeCSS(theme)}

      margin: 0;
      padding: 0;
      background-color: var(--backgroundColor);
      color: var(--textColor);
      font-size: var(--fs);
      transition: background 0.1s ease-in-out;

      position: ${isGame ? 'fixed' : 'static'};
      overscroll-behavior: none;

      font-family: -apple-system, 'Roboto', BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    }

    a {
      text-decoration: none;
      color: var(--textColor);
      cursor: pointer;
      &:hover {
        color: var(--textLowOpacity);
      }
    }

    b {
      font-weight: 600
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: 500;
    }

    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
      background-color: var(--primaryColor);
      color: ${`${theme.textColor}aa`};
      border-radius: 4px;
      padding: 3px 6px 2px;
      margin: 0px 3px;
      font-size: 0.9em;
    }

    /* fuck off, number up/down buttons on input */
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }

    /* fuck off, scrollbars */
    *::-webkit-scrollbar { width: 0px }

    /* *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    *::-webkit-scrollbar-track {
      background: none;
    }

    *::-webkit-scrollbar-thumb {
      background-color: var(--textVeryLowOpacity);
      border-radius: 25px;
      border: 3px solid var(--backgroundColor);
    }

    *::-webkit-scrollbar-thumb:hover {
      background-color: var(--textLowOpacity);
    } */
  `} />
}