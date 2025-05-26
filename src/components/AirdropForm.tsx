"use client";
import { useMemo, useState } from "react";
import InputField from "@/components/ui/InputField";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constant";
import { useChainId, useConfig, useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amounts, setAmounts] = useState("");
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  useMemo(() => console.log(calculateTotal(amounts)), [amounts]);

    
  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<number> {
    if (!tSenderAddress) {
      alert("no address found, please use a supported chain");
      return 0;
    }
    //read from the chain if there is approved enough token
    const response = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });
    return response as number;
  }

  async function handleSubmit() {
    //   1a-if approved already,do step 2
    // 1b- Approve our tsender contract to spend our tokens
    // 2- call the airdrop function on the tsender contract
    // wait for the trnasaction to be mined
    const tSenderAddress = chainsToTSender[chainId]["tsender"];
    const approvedAmount = await getApprovedAmount(tSenderAddress);
    console.log(approvedAmount);
    // if (result)
  }

  return (
    <div>
      <InputField
        label="Token Address"
        placeholder="0x..."
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />

      <InputField
        label="Recipient"
        placeholder="0x..."
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        large={true}
      />

      <InputField
        label="Amount"
        placeholder="100... 200..."
        type="number"
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)}
        large={true}
      />
      <button
        className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] text-white transition-colors font-semibold relative border `}
        onClick={handleSubmit}
      >
        send tokens
      </button>
    </div>
  );
}
