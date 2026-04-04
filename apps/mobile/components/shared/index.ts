/**
 * Shared primitives (non-feature). Prefer @/components/containers/shared for app chrome (headers, splash).
 * Layout: Figma Troott stacks / rows – see docs/figma-troott-ui.md (nodes 4081-19306, 8841-19674, 2950-19555).
 */
export { default as AppContainer } from "./app-container";
export { default as BackButton } from "./BackButton";
export { default as MarketingHeader } from "./header";
export { VStack, HStack, ScreenSection } from "@/components/ui";
export type { VStackProps, HStackProps, ScreenSectionProps, StackGap } from "@/components/ui";
