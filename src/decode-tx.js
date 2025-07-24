const ethers = require('ethers');
const crypto = require('crypto');

// Function to decode a raw hex Ethereum transaction
function decodeTransaction(rawTx) {
    try {
        // Add '0x' prefix if not present
        const cleanTx = rawTx.startsWith('0x') ? rawTx : '0x' + rawTx;
        const parsedTx = ethers.Transaction.from(cleanTx);
        console.log('=== DECODED TRANSACTION ===');
        // Show hash (if it's a complete transaction)
        if (parsedTx.hash) console.log('Hash:', parsedTx.hash);
        console.log('Type:', parsedTx.type !== null ? parsedTx.type : 0, '-', getTransactionTypeName(parsedTx.type || 0));
        console.log('To:', parsedTx.to || 'Contract Creation');
        console.log('Value:', ethers.formatEther(parsedTx.value || 0), 'ETH');
        console.log('Gas Limit:', parsedTx.gasLimit?.toString() || 'N/A');
        // Display gas pricing based on transaction type
        if (parsedTx.type === 0 || parsedTx.type === 1 || parsedTx.gasPrice) {
            console.log('Gas Price:', ethers.formatUnits(parsedTx.gasPrice || 0, 'gwei'), 'gwei');
        }
        if (parsedTx.type === 2 || parsedTx.maxFeePerGas) {
            console.log('Max Fee Per Gas:', ethers.formatUnits(parsedTx.maxFeePerGas || 0, 'gwei'), 'gwei');
            console.log('Max Priority Fee Per Gas:', ethers.formatUnits(parsedTx.maxPriorityFeePerGas || 0, 'gwei'), 'gwei');
        }
        console.log('Nonce:', parsedTx.nonce?.toString() || 'N/A');
        console.log('Chain ID:', parsedTx.chainId?.toString() || 'N/A');
        console.log('Data:', parsedTx.data || '0x');
        // Display access list for EIP-2930 and EIP-1559 transactions
        if ((parsedTx.type === 1 || parsedTx.type === 2) && parsedTx.accessList) {
            console.log('Access List:', JSON.stringify(parsedTx.accessList, null, 2));
        }
        // Show signature details if present
        if (parsedTx.signature) {
            console.log('\n=== SIGNATURE ===');
            console.log('From:', parsedTx.from || 'Unknown');
            console.log('r:', parsedTx.signature.r);
            console.log('s:', parsedTx.signature.s);
            console.log('v:', parsedTx.signature.v);
        }
        console.log();
        if (parsedTx.data && parsedTx.data !== '0x') {
            console.log('Data Length:', (parsedTx.data.length - 2) / 2, 'bytes');
        }
        console.log('SHA256:', crypto.createHash('sha256').update(cleanTx).digest('hex'));
        return parsedTx;
    } catch (error) {
        throw new Error(`Failed to decode transaction: ${error.message}`);
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
    if (args.length === 0) {
        console.log('Usage: node decode.js <raw_hex_transaction>');
        console.log('Example: node src/decode.js 0x02f0018084773594008506fc23ac0082520894d8da6bf26964af9d7eed9e03e53415d37aa9604588016345785d8a000080c0');
        process.exit(1);
    }
    const rawTx = args[0];
    try {
        decodeTransaction(rawTx);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// If called directly, run CLI interface
if (require.main === module) {
    main();
}

module.exports = { decodeTransaction, getTransactionTypeName };
