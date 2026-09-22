import {RepositoryDetail} from '@/components/repository-detail';
export default async function Page({params}:{params:Promise<{owner:string;repo:string}>}){const {owner,repo}=await params;return <RepositoryDetail owner={owner} name={repo}/>;}
