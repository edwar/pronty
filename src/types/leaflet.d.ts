declare module "leaflet" {
  const L: typeof import("leaflet")
  export = L
}

declare module "react-leaflet" {
  const RL: typeof import("react-leaflet")
  export = RL
}
