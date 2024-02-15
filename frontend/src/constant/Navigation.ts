interface INavChild {
  title: string;
  link: string;
}

export interface INavigation {
  name: string;
  link?: string;
  children?: INavChild[];
}

export const NAVIGATION: Array<INavigation> = [
  {
    name: "Swap",
    link: "/swap",
  },
];
