import express, {Request,Response} from 'express';
import bodyParser from 'body-parser';
import { v4 } from 'uuid';

import * as dotenv from 'dotenv';
dotenv.config();


import { createClient } from '@supabase/supabase-js';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import base58 from 'bs58';
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);



export const saveTransaction = async (requestBody:any) => {
    //wip get fee from the deposit
    const to = requestBody[0].nativeTransfers[0].toUserAccount
    const from = requestBody[0].nativeTransfers[0].fromUserAccount
    const amount = requestBody[0].nativeTransfers[0].amount/1000000000
    const coin = requestBody[0].accountData[2].account
    const createdAt = new Date().toISOString();
    const id = v4();
    const signature = requestBody[0].signature;

    let insertRes = await supabase.from('transactions').insert({
        id:id,
        created_at:createdAt,
        amount:amount.toString(),
        from:from,
        to:to,
        coin:coin,
        signature:signature
    })
    if(insertRes.error){
        console.log("inserted into the database: ", insertRes)
        return {error:insertRes.error}
    }else if (insertRes.statusText==="Created"){
        return {status:"success"}
    }
}

export const updateBalance = async (requestBody:any,transactionType:{status:string}) => {
    //WIP
    //if deposit
    let {status}  = transactionType
    if(status==="") return {status:"error, no transaction type"}
    if(status==="deposit"){
        const to = requestBody[0].nativeTransfers[0].toUserAccount
        const addressOwner = await supabase.from("profiles").select("*").eq('address',to)
        if(addressOwner.data){
            const currentBlance = parseFloat(addressOwner.data[0].balance)
            const amount = requestBody[0].nativeTransfers[0].amount/1000000000
            const newBalance = currentBlance+amount
            console.log("current balance: ",currentBlance,"amount: ",amount , " new balance: ",newBalance)
            const res = await supabase.from("profiles").update({balance:newBalance}).eq('address',to).select("*")
            if(res.data){
                console.log("balance updated:",res.data)
                return {status:"success"}
            }else{
                console.log("error updating balance")
                return {status:"error"}
            }
        }else{
            console.log("address not found trying to update balance")
            return {status:"error"}
        }
    }
    if(status==="withdrawal"){
        const from = requestBody[0].nativeTransfers[0].fromUserAccount
        const addressOwner = await supabase.from("profiles").select("*").eq('address',from)
        if(addressOwner.data){
            const currentBlance = parseFloat(addressOwner.data[0].balance)
            const amount = requestBody[0].nativeTransfers[0].amount/1000000000
            const newBalance = currentBlance-amount
            console.log("current balance: ",currentBlance,"amount: ",amount , " new balance: ",newBalance)
            const res = await supabase.from("profiles").update({balance:newBalance}).eq('address',from).select("*")
            if(res.data){
                console.log("balance updated:",res.data)
                return {status:"success"}
            }else{
                console.log("error updating balance")
                return {status:"error"}
            }
        }else{
            console.log("address not found trying to update balance")
            return {status:"error"}
        }
    }
    if(status==="internal"){
        const from = requestBody[0].nativeTransfers[0].fromUserAccount
        const to = requestBody[0].nativeTransfers[0].toUserAccount
        const fromAddressOwner = await supabase.from("profiles").select("*").eq('address',from)
        const toAddressOwner = await supabase.from("profiles").select("*").eq('address',to)
        if(fromAddressOwner.data && toAddressOwner.data){
            const fromCurrentBlance = parseFloat(fromAddressOwner.data[0].balance)
            const toCurrentBlance = parseFloat(toAddressOwner.data[0].balance)
            const amount = requestBody[0].nativeTransfers[0].amount/1000000000
            const newFromBalance = fromCurrentBlance-amount
            const newToBalance = toCurrentBlance+amount
            console.log("current balance: ",fromCurrentBlance,"amount: ",amount , " new balance: ",newFromBalance)
            console.log("current balance: ",toCurrentBlance,"amount: ",amount , " new balance: ",newToBalance)
            const resFrom = await supabase.from("profiles").update({balance:newFromBalance}).eq('address',from).select("*")
            const resTo = await supabase.from("profiles").update({balance:newToBalance}).eq('address',to).select("*")
            if(resFrom.data && resTo.data){
                console.log("balance updated:",resFrom.data,resTo.data)
                return {status:"success"}
            }else{
                console.log("error updating balance")
                return {status:"error"}
            }
        }else{
            console.log("address not found trying to update balance")
            return {status:"error"}
        }
    }

}

export const sendFee = async (requestBody:any) => {
    //WIP
}

export const checkTransaction = async (requestBody:any) => {
    let handleDeposit:Boolean=false;
    let handleWithdrawl:Boolean=false;
    let handleInternal:Boolean=false; //maybe it can be 100% virtual on the database not on the blockchain
    //WIP
    //if to and from exist in the database, we won't get a fee
    //if only the to exists, we will get a deposit fee
    //if the from exists, we will get a withdrawal fee
    const to = requestBody[0].nativeTransfers[0].toUserAccount
    const from = requestBody[0].nativeTransfers[0].fromUserAccount

    //fetch addresses from the database
    const toExists = await supabase.from('private_tab').select("*").eq('public_key',to)
    const fromExists = await supabase.from('private_tab').select("*").eq('public_key',from)

    if(Array(toExists.data) && toExists.data!==null && Array(fromExists.data) && fromExists.data!==null){
        if(toExists.data.length!==0 && fromExists.data.length!==0){
            //no fee
            console.log("both exist, from: ",fromExists.data, " to: ",toExists.data)

            handleInternal=true;
            return {status:"internal"}
        }
        if(toExists.data.length!==0 && fromExists.data.length===0){
            //deposit fee
            console.log("to exists")

            handleDeposit=true;
            return {status:"deposit"}
        }
        if(toExists.data.length===0 && fromExists.data.length!==0){
            //withdrawal fee
            console.log("from exists")
            handleWithdrawl=true;
            return {status:"withdrawal"}
        }
    }

}