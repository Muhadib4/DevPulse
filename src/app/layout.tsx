import type {Metadata,Viewport} from 'next';
import {Geist,Geist_Mono} from 'next/font/google';
import {Providers} from '@/components/providers';
import {Shell} from '@/components/shell';
import './globals.css';
const geist=Geist({subsets:['latin'],variable:'--font-geist'});const mono=Geist_Mono({subsets:['latin'],variable:'--font-geist-mono'});
export const metadata:Metadata={title:'DevPulse — Developer Intelligence Dashboard',description:'Explore GitHub developers, repositories, languages and public activity through a modern developer analytics dashboard.',openGraph:{title:'DevPulse — See the pulse behind the code.',description:'Your personal developer intelligence workspace.',type:'website'},manifest:'/manifest.webmanifest'};
export const viewport:Viewport={themeColor:'#0b0e14',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-theme="dark" suppressHydrationWarning><body className={`${geist.variable} ${mono.variable}`}><Providers><Shell>{children}</Shell></Providers></body></html>;}
