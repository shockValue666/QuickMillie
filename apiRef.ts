interface HeliusWebhookData {
    webhookID: string;
    project: string;
    wallet: string;
    webhookURL: string;
    accountAddresses: string[];
    transactionTypes: string[];
    webhookType: string;
}

export const createWebhook = async () => {
    try {
      const response = await fetch(
        "https://api.helius.xyz/v0/webhooks/?api-key=216aa485-33ec-4ac3-a683-7813780e07e9",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          "webhookURL": "https://typedwebhook.tools/webhook/b76a534c-4b3f-4c0f-86b1-597f461a2a44",
          "transactionTypes": ["TRANSFER","SWAP"],
          "accountAddresses": ["EaBvoZTjCYfmhLo2tGpHERZVMoD1kUyVj36hqGsu4YJm","2Brc9xk66yUXUeSvADMcfESpvfvjQc8DMZ4q3m54fUqe","BYM7pC22vUBSVuFPpTdoaH8RqZqr7SH3F2fxYXQ4sbMS"],
          "webhookType": "raw", // "rawDevnet"
          "txnStatus": "all", // success/failed
       }),
        }
      );
      const data = await response.json();
      console.log({ data });
    } catch (e) {
      console.error("error", e);
    }
};
// createWebhook();


export const getWebhook = async ():Promise<Array<string> | undefined> => {
    try {
        const response = await fetch(
            "https://api.helius.xyz/v0/webhooks/c03e9676-eb90-49c8-912c-7667dd222c15?api-key=216aa485-33ec-4ac3-a683-7813780e07e9",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            
            }
        )


        const data:any = await response.json();
        const {accountAddresses} = data
        console.log("data: ",data)
        // console.log("accountAddresses: ",accountAddresses[0])
        return accountAddresses;
    } catch (error) {   
        console.log("error getting specific webhook: ",error)
    }
}

getWebhook();

export const editWebhook = async () => {
    let existingAddresses:string[] | undefined = [];
    try {
        existingAddresses = await getWebhook();
    } catch (error) {
        console.log("error getting existing addresses: ",error)
    }
    try {
        const response = await fetch(
        "https://api.helius.xyz/v0/webhooks/c03e9676-eb90-49c8-912c-7667dd222c15?api-key=216aa485-33ec-4ac3-a683-7813780e07e9",
        {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            webhookURL: "https://typedwebhook.tools/webhook/b76a534c-4b3f-4c0f-86b1-597f461a2a44",
            transactionTypes: ["TRANSFER"],
            // accountAddresses: existingAddresses ? [...existingAddresses, "GCMm342wKHSbxcpwDJtKwH3SZ2qbQgYYyfzBrWDF9ej6"] : ["GCMm342wKHSbxcpwDJtKwH3SZ2qbQgYYyfzBrWDF9ej6"],
            accountAddresses: ['EaBvoZTjCYfmhLo2tGpHERZVMoD1kUyVj36hqGsu4YJm','BYM7pC22vUBSVuFPpTdoaH8RqZqr7SH3F2fxYXQ4sbMS'],
            webhookType: "enhanced",
            }),
        }
        );
        const data = await response.json();
        console.log({ data });
    } catch (e) {
        console.error("error", e);
    }
};
// editWebhook();

const deleteWebhook = async () => {
    try {
      const response = await fetch(
        "https://api.helius.xyz/v0/webhooks/7f6dcfd1-defb-4a1e-acd1-f01a050475b7?api-key=216aa485-33ec-4ac3-a683-7813780e07e9",
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      console.log({ data });
    } catch (e) {
      console.error("error", e);
    }
  };
//   deleteWebhook();