'use client';
import { useQuery } from '@tanstack/react-query';
import {create} from 'zustand';
import type {ContributionData,DeveloperData,Rate,RepoData,SearchData} from './types';
export const useRate=create<{rate?:Rate;setRate:(rate:Rate)=>void}>((set)=>({setRate:rate=>set({rate})}));
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
async function request<T>(params:Record<string,string>):Promise<T>{let response:Response;try{response=await fetch(`/api/github?${new URLSearchParams(params)}`);}catch{throw new ApiError('You appear to be offline. Saved items and notes are still available.',0);}const result=await response.json() as {data:T;error?:string;rate?:Rate};if(result.rate)useRate.getState().setRate(result.rate);if(!response.ok)throw new ApiError(result.error||'Unable to load GitHub data.',response.status);return result.data;}
export const useDeveloper=(username:string)=>useQuery({queryKey:['developer',username.toLowerCase()],queryFn:()=>request<DeveloperData>({kind:'developer',username}),enabled:!!username});
export const useRepository=(owner:string,repo:string)=>useQuery({queryKey:['repository',owner,repo],queryFn:()=>request<RepoData>({kind:'repository',owner,repo})});
export const useSearch=(q:string,sort:string,order:string,page:number)=>useQuery({queryKey:['search',q,sort,order,page],queryFn:()=>request<SearchData>({kind:'search',q,sort,order,page:String(page)}),enabled:!!q});
export const useContributions=(username:string)=>useQuery({queryKey:['contributions',username],queryFn:()=>request<ContributionData>({kind:'contributions',username}),enabled:!!username});
export const useApiStatus=()=>useQuery({queryKey:['status'],queryFn:()=>request<Rate&{enhanced:boolean}>({kind:'status'}),staleTime:300000});
