import { Account, CallData, Contract, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { getCompiledCode } from "./utils";
dotenv.config();

async function main() {
    const provider = new RpcProvider({
        nodeUrl: process.env.RPC_ENDPOINT,
    });

    // initialize existing predeployed account 0
    console.log("ACCOUNT_ADDRESS=", process.env.DEPLOYER_ADDRESS);
    const privateKey0 = process.env.DEPLOYER_PRIVATE_KEY ?? "";
    const accountAddress0: string = process.env.DEPLOYER_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Account connected.\n");

    // Declare & deploy contract
    let sierraCode, casmCode;

    try {
        ({ sierraCode, casmCode } = await getCompiledCode(
            "peer_protocol_PeerProtocol"
        ));
    } catch (error: any) {
        console.log("Failed to read contract files");
        console.log(error);
        process.exit(1);
    }

    const myCallData = new CallData(sierraCode.abi);

    const constructor = myCallData.compile("constructor", {
        owner: process.env.DEPLOYER_ADDRESS ?? "",
        protocol_fee_address: process.env.DEPLOYER_ADDRESS ?? "",
        spok_nft: "0x75b695aa9c1b327214b46cc5f51857713b9ea7f6e762fef1098140d10a05ca9",
        //mainnet  pragma_address: "0x2a85bd616f912537c50a49a4076db02c00b29b2cdc8a197ce92ed1837fa875b"
        pragma_address: "0x36031daa264c24520b11d93af622c848b2499b66b41d611bac95e13cfca131a"
    });

    const deployResponse = await account0.declareAndDeploy({
        contract: sierraCode,
        casm: casmCode,
        constructorCalldata: constructor,
        salt: stark.randomAddress(),
    });

    console.log('contract class hash', deployResponse.declare.class_hash);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
