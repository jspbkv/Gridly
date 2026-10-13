export interface Theme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  bgMain: string;
  bgGradient: string;
  bgBoard: string;
  boardBorder: string;
  boardShadow: string;
  cellEmpty: string;
  cellEmptyBorder: string;
  cellEmptyInnerShadow: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  accent: string;
  accentMuted: string;
  highlightGlow: string;
  blockColors: string[];
}

export const THEMES: Theme[] = [
  {
    id: 'warm-ceramic',
    name: 'Скандинавский уют',
    description: 'Тёплая керамика, льняной фон и мягкие природные тона',
    isDark: false,
    bgMain: '#f5f2eb',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #faf8f3 0%, #f0ebde 100%)',
    bgBoard: '#e5dfd3',
    boardBorder: '#d6cfc0',
    boardShadow: '0 20px 40px -12px rgba(120, 100, 80, 0.15), 0 4px 12px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.7)',
    cellEmpty: '#d8d1c2',
    cellEmptyBorder: '#cbbfad',
    cellEmptyInnerShadow: 'inset 0 2px 4px rgba(90, 75, 60, 0.12), inset 0 1px 2px rgba(90, 75, 60, 0.08)',
    textPrimary: '#2d2822',
    textSecondary: '#7d7467',
    cardBg: '#faf8f3',
    cardBorder: '#e4ddd0',
    cardShadow: '0 6px 18px -4px rgba(120, 100, 80, 0.09), 0 2px 6px rgba(0, 0, 0, 0.03)',
    accent: '#d97354',
    accentMuted: 'rgba(217, 115, 84, 0.15)',
    highlightGlow: 'rgba(230, 165, 80, 0.35)',
    blockColors: [
      '#e0634c', // Warm Terracotta
      '#ea9a3e', // Honey Ochre
      '#5aa878', // Sage Leaf
      '#8a9460', // Warm Olive
      '#b87d4b', // Warm Caramel
      '#8972b3', // Dusty Wisteria
      '#d46a84', // Muted Wild Rose
      '#d98236', // Baked Amber
    ],
  },
  {
    id: 'soft-graphite',
    name: 'Шёлковый графит',
    description: 'Уютный тёмно-серый тон без едкого синего неона',
    isDark: true,
    bgMain: '#1c1c20',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #25252b 0%, #17171a 100%)',
    bgBoard: '#28282e',
    boardBorder: '#36363f',
    boardShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
    cellEmpty: '#202025',
    cellEmptyBorder: '#2e2e36',
    cellEmptyInnerShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.3)',
    textPrimary: '#f4f4f6',
    textSecondary: '#9d9da8',
    cardBg: '#26262c',
    cardBorder: '#363640',
    cardShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.35)',
    accent: '#e58b68',
    accentMuted: 'rgba(229, 139, 104, 0.18)',
    highlightGlow: 'rgba(240, 175, 120, 0.35)',
    blockColors: [
      '#e05d5d', // Soft Crimson
      '#e68c47', // Muted Apricot
      '#e8b948', // Mustard Gold
      '#48b37e', // Mint Jade
      '#8b9454', // Olive Sage
      '#b85d7f', // Dusty Rose Heather
      '#a267c7', // Dusty Plum
      '#db6993', // Rose Quartz
    ],
  },
  {
    id: 'japanese-zen',
    name: 'Японский сад',
    description: 'Спокойная эстетика бамбука, камня и спелой хурмы',
    isDark: false,
    bgMain: '#ece6da',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #f4efe5 0%, #e5ddcd 100%)',
    bgBoard: '#dad1bf',
    boardBorder: '#c7bdab',
    boardShadow: '0 20px 40px -12px rgba(90, 80, 65, 0.16), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
    cellEmpty: '#ccc2ae',
    cellEmptyBorder: '#bdaf99',
    cellEmptyInnerShadow: 'inset 0 2px 4px rgba(70, 60, 45, 0.14)',
    textPrimary: '#26221c',
    textSecondary: '#6e6556',
    cardBg: '#f5f0e6',
    cardBorder: '#dcd3c1',
    cardShadow: '0 6px 18px -4px rgba(80, 70, 55, 0.1)',
    accent: '#c85d3f',
    accentMuted: 'rgba(200, 93, 63, 0.15)',
    highlightGlow: 'rgba(220, 140, 70, 0.35)',
    blockColors: [
      '#c85d3f', // Persimmon
      '#4f7a5b', // Matcha Moss
      '#c99a38', // Gingko Gold
      '#7d6e5d', // Stone Bronze
      '#bf6877', // Sakura Blossom
      '#886d52', // Toasted Sesame
      '#587859', // Deep Forest Moss
      '#d47c43', // Clay Ochre
    ],
  },
  {
    id: 'espresso-cozy',
    name: 'Капучино & Кашемир',
    description: 'Глубокий оттенок тёплого дерева, карамели и пенки',
    isDark: true,
    bgMain: '#241d19',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #302621 0%, #1c1613 100%)',
    bgBoard: '#352a23',
    boardBorder: '#483930',
    boardShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
    cellEmpty: '#2b211b',
    cellEmptyBorder: '#3d2f26',
    cellEmptyInnerShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.45)',
    textPrimary: '#fbf4ec',
    textSecondary: '#b7a292',
    cardBg: '#322720',
    cardBorder: '#47372d',
    cardShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.4)',
    accent: '#d98b48',
    accentMuted: 'rgba(217, 139, 72, 0.2)',
    highlightGlow: 'rgba(235, 175, 100, 0.35)',
    blockColors: [
      '#d98236', // Warm Caramel
      '#bf4e3b', // Roasted Cinnamon
      '#d4aa48', // Golden Toffee
      '#669958', // Pistachio Cream
      '#996f4c', // Roasted Nut
      '#8c5885', // Mulberry Jam
      '#cf5c73', // Wild Strawberry
      '#c26f3e', // Burnt Sienna
    ],
  },
  {
    id: 'sage-eucalyptus',
    name: 'Шалфей & Эвкалипт',
    description: 'Умиротворяющие природные оттенки оливы, хвои и шалфея',
    isDark: false,
    bgMain: '#ecefe6',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #f4f7ef 0%, #e3e8dc 100%)',
    bgBoard: '#d4ded0',
    boardBorder: '#c1ccc7',
    boardShadow: '0 20px 40px -12px rgba(80, 100, 80, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.7)',
    cellEmpty: '#c7d2c3',
    cellEmptyBorder: '#b6c2b1',
    cellEmptyInnerShadow: 'inset 0 2px 4px rgba(60, 80, 60, 0.12)',
    textPrimary: '#232d25',
    textSecondary: '#657367',
    cardBg: '#f4f8f1',
    cardBorder: '#d6dfd2',
    cardShadow: '0 6px 18px -4px rgba(70, 90, 70, 0.09)',
    accent: '#4e805d',
    accentMuted: 'rgba(78, 128, 93, 0.18)',
    highlightGlow: 'rgba(180, 210, 120, 0.35)',
    blockColors: [
      '#4e805d', // Sage Forest
      '#d97354', // Warm Terracotta
      '#d4a23a', // Honey Saffron
      '#8a9954', // Olive Leaf
      '#ba5d75', // Wild Berry
      '#a8724d', // Warm Cedar
      '#69916d', // Eucalyptus
      '#cf864e', // Apricot Clay
    ],
  },
];
