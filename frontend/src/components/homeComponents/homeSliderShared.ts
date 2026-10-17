// Shared slider data types + mapping (no 'use client', so both the server
// component that fetches and the client carousel that renders can use it).
import type { StaticImageData } from 'next/image';

export interface SlideData {
  id: string;
  image: string | StaticImageData;
  title: string;
  description?: string;
  link?: string;
}

export interface AdBoxData {
  id: string;
  image: string | StaticImageData;
  title: string;
  description?: string;
  link?: string;
  position: 'top' | 'bottom';
}

export interface HomeSliderData {
  slides: SlideData[];
  adBoxes: AdBoxData[];
}

// Default placeholder data (used only when no slides exist).
export const defaultSliderData: HomeSliderData = {
  slides: [
    { id: '1', image: '/1.webp', title: '', description: '', link: '#' },
    { id: '2', image: '/2.webp', title: '', description: '', link: '#' },
    { id: '3', image: '/3.webp', title: '', description: '', link: '#' },
  ],
  adBoxes: [
    {
      id: 'ad1',
      image: '/ad1.webp',
      title: '',
      description: '',
      link: '#',
      position: 'top',
    },
    {
      id: 'ad2',
      image: '/ad2.webp',
      title: '',
      description: '',
      link: '#',
      position: 'bottom',
    },
  ],
};

type SliderLike = {
  _id: string;
  image: string;
  title: string;
  description?: string;
  link?: string;
  type: 'hero' | 'ad_top' | 'ad_bottom';
};

export const mapSliders = (sliders: SliderLike[]): HomeSliderData => {
  const slides = sliders
    .filter((s) => s.type === 'hero')
    .map((s) => ({
      id: s._id,
      image: s.image,
      title: s.title,
      description: s.description || undefined,
      link: s.link || undefined,
    }));

  const tops = sliders
    .filter((s) => s.type === 'ad_top')
    .map((s) => ({
      id: s._id,
      image: s.image,
      title: s.title,
      description: s.description || undefined,
      link: s.link || undefined,
      position: 'top' as const,
    }));

  const bottoms = sliders
    .filter((s) => s.type === 'ad_bottom')
    .map((s) => ({
      id: s._id,
      image: s.image,
      title: s.title,
      description: s.description || undefined,
      link: s.link || undefined,
      position: 'bottom' as const,
    }));

  return { slides, adBoxes: [...tops, ...bottoms] };
};
