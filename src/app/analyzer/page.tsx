import {Suspense} from 'react';
import {Analyzer} from '@/components/dashboard';
import {Loading} from '@/components/ui';
export default function Page(){return <Suspense fallback={<Loading/>}><Analyzer/></Suspense>;}
