declare module "@/components/AppShell" {
  export function AppShell(props: Record<string, any>): any;
}

declare module "@/components/Card" {
  export function Card(props: Record<string, any>): any;
}

declare module "@/components/Sidebar" {
  export function Sidebar(props: Record<string, any>): any;
}

declare module "@/screens/Grid" {
  const GridScreen: (props: Record<string, any>) => any;
  export default GridScreen;
}

declare module "@/screens/Home" {
  const HomeScreen: (props: Record<string, any>) => any;
  export default HomeScreen;
}

declare module "@/screens/Settings" {
  const SettingsScreen: (props: Record<string, any>) => any;
  export default SettingsScreen;
}
