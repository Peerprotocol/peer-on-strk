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
        spok_nft: "0x2666e13f08728049014ba3e1cdac5e072689bd5741d806028fd7a9f368e9ca2"
    });

    const deployResponse = await account0.declareAndDeploy({
        contract: sierraCode,
        casm: casmCode,
        constructorCalldata: constructor,
        salt: stark.randomAddress(),
    });

    // Connect the new contract instance :
    const peerProtocolContract = new Contract(
        sierraCode.abi,
        deployResponse.deploy.contract_address,
        provider
    );
    console.log(
        `✅ Contract has been deploy with the address: ${peerProtocolContract.address}`
    );
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
