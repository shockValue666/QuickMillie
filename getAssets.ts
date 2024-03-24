import * as dotenv from 'dotenv';
dotenv.config();
const url = process.env.HELIUS_API_URL

interface ApiResponse {
    jsonrpc: string;
    result: {
      total: number;
      limit: number;
      page: number;
      items: any[]; // Replace 'any' with the actual type of the items if known
    };
    id: string;
}
  

const getAssetsByOwner = async () => {
    const responseFromGetAssetsByOwner = await fetch("https://mainnet.helius-rpc.com/?api-key=216aa485-33ec-4ac3-a683-7813780e07e9", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: 'BYM7pC22vUBSVuFPpTdoaH8RqZqr7SH3F2fxYXQ4sbMS',
          page: 1, // Starts at 1
          limit: 1000,
      displayOptions: {
          showFungible: true, //return both fungible and non-fungible tokens
          showNativeBalance:true
      }
        },
      }),
    });
    const result  = await responseFromGetAssetsByOwner.json() as ApiResponse;
    // if(result.result.items){
    //     result.result.items.map((item:any)=>{
    //         console.log("token conent: ",item.content)
    //     })
    // }
    console.log("Assets by Owner: ", result.result);
  };
  getAssetsByOwner(); 