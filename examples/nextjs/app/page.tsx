import { ZodiacsDemo } from "./zodiacs-demo";

export default function Page() {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "";

  return <ZodiacsDemo initialRpcUrl={rpcUrl} />;
}
