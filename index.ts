import express, {Request,Response} from 'express';
import bodyParser from 'body-parser';
import { v4 } from 'uuid';

import * as dotenv from 'dotenv';
dotenv.config();


import { createClient } from '@supabase/supabase-js';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import base58 from 'bs58';
import { checkTransaction, saveTransaction, updateBalance } from './helpers';
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);


async function fetchSampleData() {
    // Example: Query your database to fetch data from a table
    const { data, error } = await supabase
      .from('profiles') // Replace with your table name
      .select().eq('id', '6aed1b4c-6f07-4cc0-824e-c6767cacf553');
  
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
  
    // console.log('Data:', data);
    return data;
}

const addTransactionHash = async (hash:string) => {
    console.log("before supabase")
    const {data,error} = await supabase.from("hook_transactions").insert({
        id: v4(),
        created_at: new Date().toISOString(),
        content:hash
    }).select("*")
    if(data){
        console.log("data inserted successfully: ",data)
    }
    if(error){
        console.log("error inserting transaction hash: ",error);
        return;
    }
    return data;
}

const app = express()
const port = 8888;


//We are expecting the body to contain valid JSON from the Helius request
app.use(bodyParser.json());

//This is our actual webhook that is served locally at http://localhost:8888/webhook.
//By using ngrok, the ngrok provided public url will map to our local webhook
//https://31a4-2a02-586-4b34-e9a2-70d6-2ff6-8b1d-5228.ngrok-free.app -> http://localhost:8888/webhook

app.get("/", (request: Request, response: Response) => {
    response.status(200).send("Server is running");
});

app.post('/webhook', (request: Request, response: Response) => {
    const requestBody = request.body;   
    //print the json to the console
    console.log("data received by the webhook: ", requestBody);

    //send a response that we received and processed the request
    response.status(200).send('Webhook received the request lolllll');
});

app.post("/",async (request: Request, response: Response) => {
    console.log("root")
    console.log("request body: ",typeof request.body);
    const newId = v4()
    const newDate = new Date().toISOString();
    console.log("newId: ",newId, " newDate: ",newDate);
    const data = await fetchSampleData();
    console.log("data from the post: ",data);
    console.log("after")

    response.status(200).send("Request received");
})


app.post("/test",async (request: Request, response: Response) => {
    // console.log("test",JSON.stringify(request.body))
    const data = await addTransactionHash(JSON.stringify(request.body));
    if(data){
        console.log("data from the post: ",data);
        return response.status(200).send("Request received");
    }
    return response.status(500).send("Error adding transaction hash");
})


app.post('/details', async (request: Request, response: Response) => {
    const requestBody = request.body;   
    const amount = requestBody[0].nativeTransfers[0].amount/1000000000;
    if(request.body[0]){
        const transactionType = await checkTransaction(request.body);
        const savedStatus = await saveTransaction(request.body);
        await updateBalance(request.body,transactionType || {status:""});
    //     await sendFee(request.body);
    }
    //print the json to the console
    console.log("data received by the webhook: ", requestBody[0].signature);
    const connection = new Connection(process.env.HELIUS_API_URL || "");
    if(requestBody){
        console.log("type: ",requestBody[0].type)
        //if the type is "transfer", we will tranfer 6.66% to 7CXWdAC1iYw6BWDj1hQbETeoAAgLCvZJZGXiBG6xF4DG
        if(requestBody[0].type === "TRANSFER"){
            
            
            //let res = await supabase.from("private_tab").select("*").eq('public_key',requestBody[0].nativeTransfers[0].toUserAccount)
            //.eq('public_key',requestBody[0].nativeTransfers[0].toUserAccount)
            // if(res?.data){
            //     //send the fee to the big boss
            //     let privateKey = res.data[0].private_key;
            //     let privateKeyArray = privateKey.split(',');
            //     privateKey=privateKeyArray.map((item:string)=>{
            //         return parseInt(item);
            //     })
            //     const fromUint9array = new Uint8Array(privateKeyArray);
            //     const encoding = base58.encode(fromUint9array);
            //     const sk = base58.decode(encoding);
            //     let from = Keypair.fromSecretKey(sk);
            //     const to = new PublicKey("7CXWdAC1iYw6BWDj1hQbETeoAAgLCvZJZGXiBG6xF4DG");
            //     const transaction = new Transaction().add(
            //         SystemProgram.transfer({
            //             fromPubkey: from.publicKey,
            //             toPubkey:to,
            //             lamports: LAMPORTS_PER_SOL/100
            //         })
            //     )
            //     const signature = await sendAndConfirmTransaction(
            //         connection,
            //         transaction,
            //         [from]
            //     )
            //     console.log("signature: ",signature)
            //     //check if the new transfer transaction sender is the same as the previous one
            // }   
        }
        // console.log("accountdata: ",requestBody[0].nativeTransfers[0].toUserAccount)
    }

    //send a response that we received and processed the request
    response.status(200).send('Webhook received the request funny (straight face)');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});




