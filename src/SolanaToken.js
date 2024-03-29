import React, { useState } from 'react'
import './solanaToken.css';

import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { createMint, createSetAuthorityInstruction, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, transferChecked } from "@solana/spl-token";
import { Buffer } from 'buffer';
import bs58 from 'bs58';
// import { Transaction as tr } from '@thirdweb-dev/sdk';


const SolanaToken = () => {

    window.Buffer = Buffer;
    const [senderWallet, setSenderWallet] = useState(null);

    const connection = new Connection('https://api.testnet.solana.com', "recent");



    // const connection = new Connection('https://solana-mainnet.core.chainstack.com/668dbd69868bccfce0ebfe8696a8ccfa', {
    //     wsEndpoint: "wss://solana-mainnet.core.chainstack.com/ws/668dbd69868bccfce0ebfe8696a8ccfa"
    // });


    const CreateAndShare = async () => {
        try {
            // Generate token
            const walletKeyPair = Keypair.fromSecretKey(new Uint8Array(bs58.decode("4FCjrRWgEAmvQ8hVzC98SCfJoGdBdjfxKsFU5Gh4WjfCaqen2T9WcyGa6DZaMbzmibvV5UPzR7XkuCB4EEmL6bYX")));
            let balanceBefore = await connection.getBalance(walletKeyPair.publicKey);
            console.log("Balance before minting:", balanceBefore / LAMPORTS_PER_SOL);

            const mint = await createMint(
                connection,
                walletKeyPair,
                walletKeyPair.publicKey,
                null,
                9,
                undefined,
                {},
                TOKEN_PROGRAM_ID
            );
            console.log("Mint created:", mint);

            const tokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                walletKeyPair,
                mint,
                walletKeyPair.publicKey
            );
            console.log("Token account created:", tokenAccount);

            // Mint tokens to the associated token account
            const mintTransaction = await mintTo(
                connection,
                walletKeyPair,
                mint,
                tokenAccount.address,
                walletKeyPair.publicKey,
                1000000000000
            );
            console.log("Mint transaction:", mintTransaction);

            let balanceAfter = await connection.getBalance(walletKeyPair.publicKey);
            console.log("Balance after minting:", balanceAfter / LAMPORTS_PER_SOL);

            // Calculate fee
            const feePercentage = 0.30; // 30%
            const transferAmount = 1; // Assuming 1 SOL is being transferred
            const feeAmount = transferAmount * feePercentage;
            console.log("Fee 30% ", feeAmount);

            // Send SOL transaction
            const senderWallet = await Keypair.fromSecretKey(bs58.decode("4FCjrRWgEAmvQ8hVzC98SCfJoGdBdjfxKsFU5Gh4WjfCaqen2T9WcyGa6DZaMbzmibvV5UPzR7XkuCB4EEmL6bYX"));
            const receiverWallet = Keypair.fromSecretKey(bs58.decode("2Mt3AFeYzhvay4RmmCSQXX3LJ5RKmoWoAWD6vs3goTQj6qsgoaRSDAHE66DjZv6mRUs7uvNouHi6pUfjgCxw9SNQ"));
            const wallet3 = Keypair.fromSecretKey(bs58.decode("4sZgLpHwjypdtyjhUCN1r4w8RTttH94Ebha4eN6Diax4ntnhTVaVeAnZSF4fnSVz4UPEsY8Rvzv6DEihP4HS98uD"));

            let senderBalance = await connection.getBalance(senderWallet.publicKey);
            let receiverBalance = await connection.getBalance(receiverWallet.publicKey);

            console.log(senderBalance / LAMPORTS_PER_SOL);

            let transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: senderWallet.publicKey,
                    toPubkey: receiverWallet.publicKey,
                    lamports: (transferAmount - feeAmount) * LAMPORTS_PER_SOL // Deducting fee amount from transfer amount
                }),
                SystemProgram.transfer({
                    fromPubkey: senderWallet.publicKey,
                    toPubkey: wallet3.publicKey,
                    lamports: feeAmount * LAMPORTS_PER_SOL // Sending fee to wallet 3
                })
            );

            transaction.feePayer = senderWallet.publicKey;
            let transactionHash = await connection.sendTransaction(transaction, [senderWallet, receiverWallet, wallet3]);

            console.log(transactionHash);
        } catch (error) {
            console.error("Error:", error);
        }
    }



    const CreateTokenAndTax = async () => {
        try {
            // Generate token
            const walletKeyPair = Keypair.fromSecretKey(new Uint8Array(bs58.decode("2Mt3AFeYzhvay4RmmCSQXX3LJ5RKmoWoAWD6vs3goTQj6qsgoaRSDAHE66DjZv6mRUs7uvNouHi6pUfjgCxw9SNQ")));
            let balanceBefore = await connection.getBalance(walletKeyPair.publicKey);
            // Exit the function if the wallet has less than 3 SOL
            const solBalance = balanceBefore / LAMPORTS_PER_SOL;
            console.log("Wallet balance:", solBalance);
            const minSol = 2;
            if (solBalance < minSol) {
                console.log(`Wallet balance is insufficient. should be more than ${minSol} SOL`);
                return;
            }

            console.log("Balance before minting:", balanceBefore / LAMPORTS_PER_SOL);

            const mint = await createMint(
                connection,
                walletKeyPair,
                walletKeyPair.publicKey,
                null,
                9,
                undefined,
                {},
                TOKEN_PROGRAM_ID
            );




            const tokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                walletKeyPair,
                mint,
                walletKeyPair.publicKey
            );
            console.log("Token account created:", tokenAccount);

            // Calculate fee
            const feePercentage = 0.30; // 30%
            const mintingAmount = 1; // Assuming 1 SOL worth of tokens is being minted
            const feeAmount = mintingAmount * feePercentage;
            console.log("Fee 30%:", feeAmount);

            // Deduct fee from minting amount
            const mintingAmountAfterFee = mintingAmount - feeAmount;

            // Mint tokens to the associated token account
            const mintTransaction = await mintTo(
                connection,
                walletKeyPair,
                mint,
                tokenAccount.address,
                walletKeyPair.publicKey,
                mintingAmountAfterFee * LAMPORTS_PER_SOL // Convert to lamports
            );
            console.log("Mint transaction:", mintTransaction);

            let balanceAfter = await connection.getBalance(walletKeyPair.publicKey);
            console.log("Balance after minting:", balanceAfter / LAMPORTS_PER_SOL);

            // Send fee to wallet 2
            const wallet2 = Keypair.fromSecretKey(bs58.decode("4FCjrRWgEAmvQ8hVzC98SCfJoGdBdjfxKsFU5Gh4WjfCaqen2T9WcyGa6DZaMbzmibvV5UPzR7XkuCB4EEmL6bYX"));

            let transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: walletKeyPair.publicKey,
                    toPubkey: wallet2.publicKey,
                    lamports: feeAmount * LAMPORTS_PER_SOL // Sending fee to wallet 2
                })
            );

            transaction.feePayer = walletKeyPair.publicKey;
            let transactionHash = await connection.sendTransaction(transaction, [walletKeyPair, wallet2]);

            console.log("transaction hash", transactionHash);
        } catch (error) {
            console.error("Error:", error);
        }
    }




    return (
        <div className='container'>


            <button onClick={CreateAndShare}>Create Token And Share Sol</button>
            <button onClick={CreateTokenAndTax}>CreateToken And Tax Transfer</button>

        </div>
    )
}

export default SolanaToken