import { NextRequest,NextResponse } from 'next/server';
import { github,GitHubError } from '@/lib/github/server';
import type { Developer, Repository,GitEvent,SearchData,ContributionData } from '@/lib/github/types';
import {validUsername} from '@/lib/utils';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const p=request.nextUrl.searchParams;const kind=p.get('kind');const username=p.get('username')||'';
 try{
  if(kind==='status'){const result=await github<{resources:{core:{remaining:number;limit:number;reset:number}}}>('/rate_limit');return NextResponse.json({data:{...result.data.resources.core,enhanced:!!process.env.GITHUB_TOKEN},rate:result.data.resources.core});}
  if(kind==='developer'||kind==='contributions'){
   if(!validUsername(username))return NextResponse.json({error:'Enter a valid GitHub username (1–39 letters, numbers or hyphens).'}, {status:400});
   if(kind==='contributions'){
    if(!process.env.GITHUB_TOKEN)return NextResponse.json({data:{available:false,reason:'Contribution calendar requires enhanced GitHub API access.'} satisfies ContributionData});
    const result=await github<{data?:{user:{contributionsCollection:{contributionCalendar:{totalContributions:number;weeks:NonNullable<ContributionData['weeks']>}}}|null};errors?:{message:string}[]}>('/graphql',{method:'POST',body:JSON.stringify({query:'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}}}',variables:{login:username}})});
    const calendar=result.data.data?.user?.contributionsCollection.contributionCalendar;
    return NextResponse.json({data:calendar?{available:true,...calendar}:{available:false,reason:'Contribution calendar is unavailable with the configured GitHub access.'}});
   }
   const profile=await github<Developer>(`/users/${username}`);const repos:Repository[]=[];const events:GitEvent[]=[];const warnings:string[]=[];let repoTruncated=false,eventTruncated=false;let rate=profile.rate;
   for(let page=1;page<=3;page++){try{const result=await github<Repository[]>(`/users/${username}/repos?per_page=100&sort=updated&type=owner&page=${page}`);repos.push(...result.data);rate=result.rate;repoTruncated=result.more;if(!result.more)break;}catch(e){warnings.push(e instanceof Error?e.message:'Repositories unavailable');repoTruncated=true;break;}}
   for(let page=1;page<=3;page++){try{const result=await github<GitEvent[]>(`/users/${username}/events/public?per_page=100&page=${page}`);events.push(...result.data);rate=result.rate;eventTruncated=result.more;if(!result.more)break;}catch(e){warnings.push(e instanceof Error?e.message:'Activity unavailable');eventTruncated=true;break;}}
   return NextResponse.json({data:{profile:profile.data,repos,events,repoTruncated,eventTruncated,warnings},rate});
  }
  if(kind==='search'){
   const q=(p.get('q')||'').trim();if(!q||q.length>256)return NextResponse.json({error:'Enter a search query of 1–256 characters.'},{status:400});
   const sort=p.get('sort');const page=Math.min(34,Math.max(1,Number(p.get('page'))||1));const params=new URLSearchParams({q,per_page:'30',page:String(page),order:p.get('order')==='asc'?'asc':'desc'});if(sort&&['stars','forks','updated'].includes(sort))params.set('sort',sort);
   const result=await github<SearchData>(`/search/repositories?${params}`);return NextResponse.json({data:result.data,rate:result.rate});
  }
  if(kind==='repository'){
   const owner=p.get('owner')||'';const name=p.get('repo')||'';if(!validUsername(owner)||! /^[\w.-]{1,100}$/.test(name))return NextResponse.json({error:'Invalid repository path.'},{status:400});
   const base=`/repos/${owner}/${name}`;const result=await github<Repository>(base);const warnings:string[]=[];
   const [languages,readme]=await Promise.allSettled([github<Record<string,number>>(`${base}/languages`),github<{content:string;encoding:string;size:number}>(`${base}/readme`)]);
   if(languages.status==='rejected')warnings.push('Language byte analysis is temporarily unavailable.');
   if(readme.status==='rejected'&&(!(readme.reason instanceof GitHubError)||readme.reason.status!==404))warnings.push('README could not be retrieved.');
   return NextResponse.json({data:{repo:result.data,languages:languages.status==='fulfilled'?languages.value.data:{},readme:readme.status==='fulfilled'&&readme.value.data.encoding==='base64'?Buffer.from(readme.value.data.content,'base64').toString('utf8').slice(0,150000):null,warnings},rate:languages.status==='fulfilled'?languages.value.rate:result.rate});
  }
  return NextResponse.json({error:'Unknown GitHub request.'},{status:400});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unexpected server error.',rate:error instanceof GitHubError?error.rate:undefined},{status:error instanceof GitHubError?error.status:500});}
}
