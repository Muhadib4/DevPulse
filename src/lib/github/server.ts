import 'server-only';
import type { Rate } from './types';
export class GitHubError extends Error { constructor(message:string,public status:number,public rate?:Rate){super(message);} }
export async function github<T>(path:string,init?:RequestInit):Promise<{data:T;rate?:Rate;more:boolean}> {
  let response:Response;
  try { response=await fetch(`https://api.github.com${path}`,{...init,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'DevPulse',...(process.env.GITHUB_TOKEN?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`} : {}),...init?.headers},signal:AbortSignal.timeout(15000),cache:'no-store'}); }
  catch {throw new GitHubError('GitHub could not be reached. Check your connection and try again.',502);}
  const remaining=response.headers.get('x-ratelimit-remaining');
  const rate=remaining!==null?{remaining:Number(remaining),limit:Number(response.headers.get('x-ratelimit-limit')),reset:Number(response.headers.get('x-ratelimit-reset'))}:undefined;
  if(!response.ok){const limited=response.status===429||(response.status===403&&rate?.remaining===0);throw new GitHubError(limited?'GitHub request limit reached. Wait for the reset time before refreshing.':response.status===404?'The requested GitHub developer or repository was not found.':response.status===401?'The server GitHub token is invalid. Contact the site administrator.':response.status===403?'GitHub temporarily restricted this request. Please try again later.':response.status===422?'GitHub could not process this search. Check your query and filters.':'GitHub is temporarily unavailable. Please try again.',limited?429:response.status,rate);}
  return {data:await response.json() as T,rate,more:response.headers.get('link')?.includes('rel="next"')??false};
}
