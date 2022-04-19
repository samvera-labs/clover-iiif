/// <reference types="react" />
export declare const theme: {
    colors: {
        primary: string;
        primaryMuted: string;
        primaryAlt: string;
        accent: string;
        accentMuted: string;
        accentAlt: string;
        secondary: string;
        secondaryMuted: string;
        secondaryAlt: string;
    };
    fonts: {
        sans: string;
        display: string;
    };
    transitions: {
        all: string;
    };
};
export declare const media: {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    xl: string;
    lg: string;
};
export declare const styled: <Type extends import("react").ComponentType<any> | keyof JSX.IntrinsicElements | import("@stitches/react/types/util").Function, Composers extends (string | import("react").ComponentType<any> | import("@stitches/react/types/util").Function | {
    [name: string]: unknown;
})[], CSS = import("@stitches/react/types/css-util").CSS<{
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    xl: string;
    lg: string;
}, {
    colors: {
        primary: string;
        primaryMuted: string;
        primaryAlt: string;
        accent: string;
        accentMuted: string;
        accentAlt: string;
        secondary: string;
        secondaryMuted: string;
        secondaryAlt: string;
    };
    fonts: {
        sans: string;
        display: string;
    };
    transitions: {
        all: string;
    };
}, import("@stitches/react/types/config").DefaultThemeMap, {}>>(type: Type, ...composers: { [K in keyof Composers]: Composers[K] extends string | import("react").ComponentType<any> | import("@stitches/react/types/util").Function ? Composers[K] : import("@stitches/react/types/stitches").RemoveIndex<CSS> & {
    variants?: {
        [x: string]: {
            [x: string]: CSS;
            [x: number]: CSS;
        };
    } | undefined;
    compoundVariants?: (("variants" extends keyof Composers[K] ? { [Name in keyof Composers[K][keyof Composers[K] & "variants"]]?: import("@stitches/react/types/util").String | import("@stitches/react/types/util").Widen<keyof Composers[K][keyof Composers[K] & "variants"][Name]> | undefined; } : import("@stitches/react/types/util").WideObject) & {
        css: CSS;
    })[] | undefined;
    defaultVariants?: ("variants" extends keyof Composers[K] ? { [Name_1 in keyof Composers[K][keyof Composers[K] & "variants"]]?: import("@stitches/react/types/util").String | import("@stitches/react/types/util").Widen<keyof Composers[K][keyof Composers[K] & "variants"][Name_1]> | undefined; } : import("@stitches/react/types/util").WideObject) | undefined;
} & CSS & { [K2 in keyof Composers[K]]: K2 extends "compoundVariants" | "defaultVariants" | "variants" ? unknown : K2 extends keyof CSS ? CSS[K2] : unknown; }; }) => import("@stitches/react/types/styled-component").StyledComponent<Type, import("@stitches/react/types/styled-component").StyledComponentProps<Composers>, {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    xl: string;
    lg: string;
}, import("@stitches/react/types/css-util").CSS<{
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    xl: string;
    lg: string;
}, {
    colors: {
        primary: string;
        primaryMuted: string;
        primaryAlt: string;
        accent: string;
        accentMuted: string;
        accentAlt: string;
        secondary: string;
        secondaryMuted: string;
        secondaryAlt: string;
    };
    fonts: {
        sans: string;
        display: string;
    };
    transitions: {
        all: string;
    };
}, import("@stitches/react/types/config").DefaultThemeMap, {}>>, css: <Composers extends (string | import("react").JSXElementConstructor<any> | import("react").ExoticComponent<any> | import("@stitches/react/types/util").Function | {
    [name: string]: unknown;
})[], CSS = import("@stitches/react/types/css-util").CSS<{
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    xl: string;
    lg: string;
}, {
    colors: {
        primary: string;
        primaryMuted: string;
        primaryAlt: string;
        accent: string;
        accentMuted: string;
        accentAlt: string;
        secondary: string;
        secondaryMuted: string;
        secondaryAlt: string;
    };
    fonts: {
        sans: string;
        display: string;
    };
    transitions: {
        all: string;
    };
}, import("@stitches/react/types/config").DefaultThemeMap, {}>>(...composers: { [K in keyof Composers]: Composers[K] extends string | import("react").JSXElementConstructor<any> | import("react").ExoticComponent<any> | import("@stitches/react/types/util").Function ? Composers[K] : import("@stitches/react/types/stitches").RemoveIndex<CSS> & {
    variants?: {
        [x: string]: {
            [x: string]: CSS;
            [x: number]: CSS;
        };
    } | undefined;
    compoundVariants?: (("variants" extends keyof Composers[K] ? { [Name in keyof Composers[K][keyof Composers[K] & "variants"]]?: import("@stitches/react/types/util").String | import("@stitches/react/types/util").Widen<keyof Composers[K][keyof Composers[K] & "variants"][Name]> | undefined; } : import("@stitches/react/types/util").WideObject) & {
        css: CSS;
    })[] | undefined;
    defaultVariants?: ("variants" extends keyof Composers[K] ? { [Name_1 in keyof Composers[K][keyof Composers[K] & "variants"]]?: import("@stitches/react/types/util").String | import("@stitches/react/types/util").Widen<keyof Composers[K][keyof Composers[K] & "variants"][Name_1]> | undefined; } : import("@stitches/react/types/util").WideObject) | undefined;
} & CSS & { [K2 in keyof Composers[K]]: K2 extends "compoundVariants" | "defaultVariants" | "variants" ? unknown : K2 extends keyof CSS ? CSS[K2] : unknown; }; }) => import("@stitches/react/types/styled-component").CssComponent<import("@stitches/react/types/styled-component").StyledComponentType<Composers>, import("@stitches/react/types/styled-component").StyledComponentProps<Composers>, {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    xl: string;
    lg: string;
}, CSS>, keyframes: (style: {
    [offset: string]: import("@stitches/react/types/css-util").CSS<{
        xxs: string;
        xs: string;
        sm: string;
        md: string;
        xl: string;
        lg: string;
    }, {
        colors: {
            primary: string;
            primaryMuted: string;
            primaryAlt: string;
            accent: string;
            accentMuted: string;
            accentAlt: string;
            secondary: string;
            secondaryMuted: string;
            secondaryAlt: string;
        };
        fonts: {
            sans: string;
            display: string;
        };
        transitions: {
            all: string;
        };
    }, import("@stitches/react/types/config").DefaultThemeMap, {}>;
}) => {
    (): string;
    name: string;
}, createTheme: <Argument0 extends string | ({
    colors?: {
        primary?: string | number | boolean | undefined;
        primaryMuted?: string | number | boolean | undefined;
        primaryAlt?: string | number | boolean | undefined;
        accent?: string | number | boolean | undefined;
        accentMuted?: string | number | boolean | undefined;
        accentAlt?: string | number | boolean | undefined;
        secondary?: string | number | boolean | undefined;
        secondaryMuted?: string | number | boolean | undefined;
        secondaryAlt?: string | number | boolean | undefined;
    } | undefined;
    fonts?: {
        sans?: string | number | boolean | undefined;
        display?: string | number | boolean | undefined;
    } | undefined;
    transitions?: {
        all?: string | number | boolean | undefined;
    } | undefined;
} & {
    [x: string]: {
        [x: string]: string | number | boolean;
        [x: number]: string | number | boolean;
    };
}), Argument1 extends string | ({
    colors?: {
        primary?: string | number | boolean | undefined;
        primaryMuted?: string | number | boolean | undefined;
        primaryAlt?: string | number | boolean | undefined;
        accent?: string | number | boolean | undefined;
        accentMuted?: string | number | boolean | undefined;
        accentAlt?: string | number | boolean | undefined;
        secondary?: string | number | boolean | undefined;
        secondaryMuted?: string | number | boolean | undefined;
        secondaryAlt?: string | number | boolean | undefined;
    } | undefined;
    fonts?: {
        sans?: string | number | boolean | undefined;
        display?: string | number | boolean | undefined;
    } | undefined;
    transitions?: {
        all?: string | number | boolean | undefined;
    } | undefined;
} & {
    [x: string]: {
        [x: string]: string | number | boolean;
        [x: number]: string | number | boolean;
    };
})>(nameOrScalesArg0: Argument0, nameOrScalesArg1?: Argument1 | undefined) => string & {
    className: string;
    selector: string;
} & (Argument0 extends string ? import("@stitches/react/types/stitches").ThemeTokens<Argument1, ""> : import("@stitches/react/types/stitches").ThemeTokens<Argument0, "">);
