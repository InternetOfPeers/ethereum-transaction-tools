const ethers = require('ethers');

// Function to sign an unsigned Ethereum transaction
function signTransaction(unsignedTx, privateKey) {
    try {
        // Add '0x' prefix if not present
        const hexUnsignedTx = unsignedTx.startsWith('0x') ? unsignedTx : '0x' + unsignedTx;
        const hexPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
        const wallet = new ethers.Wallet(hexPrivateKey);
        const parsedTx = ethers.Transaction.from(hexUnsignedTx);
        parsedTx.signature = wallet.signingKey.sign(parsedTx.unsignedHash);
        const serializedSignedTx = parsedTx.serialized;
        console.log('=== TRANSACTION SIGNING ===');
        console.log('Transaction Hash:', parsedTx.hash);
        console.log('Transaction Type:', parsedTx.type !== null ? parsedTx.type : 0, '-', getTransactionTypeName(parsedTx.type || 0));
        console.log('Signer Address:', wallet.address);
        console.log('Signed Transaction:', serializedSignedTx);
        return {
            signedTx: serializedSignedTx,
            hash: parsedTx.hash,
            signerAddress: wallet.address,
            signature: {
                r: parsedTx.signature.r,
                s: parsedTx.signature.s,
                v: parsedTx.signature.v
            }
        };
    } catch (error) {
        throw new Error(`Failed to sign transaction: ${error.message}`);
    }
}

// Function to validate private key format
function validatePrivateKey(privateKey) {
    try {
        const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
        new ethers.Wallet(cleanPrivateKey);
        return true;
    } catch (error) {
        return false;
    }
}

// Helper function to get transaction type name
function getTransactionTypeName(type) {
    switch (type) {
        case 0: return 'Legacy';
        case 1: return 'EIP-2930 (Access List)';
        case 2: return 'EIP-1559';
        default: return `Unknown (${type})`;
    }
}

// Main function for CLI usage
function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node sign.js <unsigned_hex_transaction> <private_key>');
        console.log('Example: node src/sign.js 0xec808504a817c80082520894d8da6bf26964af9d7eed9e03e53415d37aa9604588016345785d8a000080018080 0x0000000000000000000000000000000000000000000000000000000000000001');
        console.log('\nWarning: Never share private keys publicly!');
        process.exit(1);
    }
    const unsignedTx = args[0];
    const privateKey = args[1];
    if (!validatePrivateKey(privateKey)) {
        console.error('Error: Invalid private key format');
        process.exit(1);
    }
    try {
        signTransaction(unsignedTx, privateKey);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// If called directly, run CLI interface
if (require.main === module) {
    main();
}

module.exports = { signTransaction, validatePrivateKey, getTransactionTypeName };
