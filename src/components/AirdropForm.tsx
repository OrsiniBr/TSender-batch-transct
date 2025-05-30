"use client";
import { useMemo, useState } from "react";
import InputField from "@/components/ui/InputField";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constant";
import {
  useChainId,
  useConfig,
  useAccount,
  useWriteContract,
  useReadContracts,
} from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";
import { CgSpinner } from "react-icons/cg";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setrecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  const { data: hash, isPending, writeContractAsync } = useWriteContract({})
  const { data: tokenData } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "name",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "balanceOf",
        args: [account.address],
      },
    ],
  });

    
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
    if (approvedAmount < total) {
      let isPending = true;
      const approvalHash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "approve",
        args: [tSenderAddress as `0x${string}`, BigInt(total)],
      });
      const apporvalReciept = await waitForTransactionReceipt(config, {
        hash: approvalHash,
      });
      console.log("Approval confirmed:", apporvalReciept);
      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          // Comma or new line separated
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ""),
          BigInt(total),
        ],
      });
      isPending = false;
    } else {
      let isPending = true;
      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          // Comma or new line separated
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ""),
          BigInt(total),
        ],
      });
      isPending = false;

    }
    //0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
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
        label="recipients"
        placeholder="0x..."
        value={recipients}
        onChange={(e) => setrecipients(e.target.value)}
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
          Send Tokens
        
      </button>
    </div>
  );
}
