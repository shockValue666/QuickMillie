
    import { Keypair, Transaction, Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from "@solana/web3.js";
    import { createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
    import * as bs58 from "bs58";
    import * as dotenv from 'dotenv';
    dotenv.config();

    export const transfer = async () => {
        const connection = new Connection(process.env.HELIUS_API_URL || "");
        //public key: EaBvoZTjCYfmhLo2tGpHERZVMoD1kUyVj36hqGsu4YJm
        const pk = process.env.PK || ""
        let sk = bs58.decode(pk)
        let skarray = new Uint8Array(sk)
        const from = Keypair.fromSecretKey(sk)

        // const to = new PublicKey("BYM7pC22vUBSVuFPpTdoaH8RqZqr7SH3F2fxYXQ4sbMS");
        const to = new PublicKey("14Qxow2QyiNqSFpw5MK5DpS7f3nFdLktuwQSaSL5N2pa")
        

        const randomDivider = Math.floor(Math.random() * (1000 - 100 + 1)) + 100
        const lamps = Math.floor(LAMPORTS_PER_SOL/randomDivider)
        console.log("randomDivider: ",randomDivider)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey:to,
                lamports: lamps
            })
        )
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        )
        console.log("signature: ",signature)

    }
    transfer()
