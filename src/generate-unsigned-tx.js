const ethers = require('ethers');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

// Function to create unsigned transaction
async function createUnsignedTransaction(txData) {
    try {
        // Validate required fields
        if (!txData.to) throw new Error('Missing required fields: to');

        // Determine transaction type based on provided fields
        let txType = txData.type !== undefined ? txData.type : 2; // Default to EIP-1559
        // Validate transaction type
        if (![0, 1, 2].includes(txType)) {
            throw new Error('Invalid transaction type. Must be 0 (Legacy), 1 (EIP-2930), or 2 (EIP-1559)');
        }
        // Prepare base transaction object
        const transaction = {
            type: txType,
            chainId: txData.chainId || 1,
            to: txData.to,
            value: txData.value || 0,
            gasLimit: txData.gasLimit || 21000,
            nonce: txData.nonce || 0,
            data: txData.data || '0x'
        };
        // Add type-specific fields
        if (txType === 0) {
            // Legacy transaction (Type 0)
            transaction.gasPrice = txData.gasPrice || ethers.parseUnits('1', 'gwei');
        } else if (txType === 1) {
            // EIP-2930 Access List transaction (Type 1)
            transaction.gasPrice = txData.gasPrice || ethers.parseUnits('1', 'gwei');
            transaction.accessList = txData.accessList || [];
        } else if (txType === 2) {
            // EIP-1559 transaction (Type 2)
            transaction.maxFeePerGas = txData.maxFeePerGas || ethers.parseUnits('2', 'gwei');
            transaction.maxPriorityFeePerGas = txData.maxPriorityFeePerGas || ethers.parseUnits('1', 'gwei');
            transaction.accessList = txData.accessList || [];
        }
        // Serialize unsigned transaction
        const unsignedTx = ethers.Transaction.from(transaction);
        const serialized = unsignedTx.unsignedSerialized;

        console.log('=== TRANSACTION DETAILS===');
        console.log('Type:', txType, getTransactionTypeName(txType));
        console.log('To:', transaction.to);
        console.log('Value:', ethers.formatEther(transaction.value), 'ETH');
        console.log('Gas Limit:', transaction.gasLimit.toString());

        if (txType === 0 || txType === 1) {
            console.log('Gas Price:', ethers.formatUnits(transaction.gasPrice, 'gwei'), 'gwei');
        } else if (txType === 2) {
            console.log('Max Fee Per Gas:', ethers.formatUnits(transaction.maxFeePerGas, 'gwei'), 'gwei');
            console.log('Max Priority Fee Per Gas:', ethers.formatUnits(transaction.maxPriorityFeePerGas, 'gwei'), 'gwei');
        }

        console.log('Nonce:', transaction.nonce);
        console.log('Data:', transaction.data);
        console.log('Chain ID:', transaction.chainId);

        if (txType === 1 || txType === 2) {
            console.log('Access List:', JSON.stringify(transaction.accessList));
        }
        console.log();
        console.log('Unsigned TX:', serialized);
        console.log('Length:', serialized.length, 'bytes');
        console.log('SHA256:', crypto.createHash('sha256').update(serialized).digest('hex'));
        return serialized;
    } catch (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
    }
}

// Function to generate QR code, print to the terminal, and save as two PNGs (string and binary)
async function generateQRCode(data) {
    try {
        // Print QR code (string) to terminal
        qrcode.generate(data, { small: true });
        // Create a unique filename based on the serialized transaction
        const filename = crypto.createHash('sha256').update(data).digest('hex');
        // Ensure the directory exists
        const qrCodeDir = path.join(__dirname, '..', 'qr-codes');
        if (!fs.existsSync(qrCodeDir)) fs.mkdirSync(qrCodeDir, { recursive: true });
        const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        let outputPath = path.join(qrCodeDir, `${sanitizedFilename}.png`);
        await QRCode.toFile(outputPath, data, { errorCorrectionLevel: 'L', color: { dark: '#006eecff', light: '#FFFFFF' }, width: 512 });
        console.log(`QR code (string) saved as: ${outputPath}`);
        // Convert hex string to binary data for QR code encoding
        // Binary data can be useful for more compact representation when the data is too large
        const binaryData = Buffer.from(data.startsWith('0x') ? data.slice(2) : data, 'hex');
        // Generate QR code with binary data
        outputPath = path.join(qrCodeDir, `${sanitizedFilename}-binary.png`);
        await QRCode.toFile(outputPath, [{ data: binaryData, mode: 'byte' }], {
            errorCorrectionLevel: 'L',
            color: { dark: '#006eecff', light: '#FFFFFF' },
            width: 512
        });
        console.log(`QR code (binary) saved as: ${outputPath}`);
        return outputPath;
    } catch (error) {
        throw new Error(`Failed to generate QR code: ${error.message}`);
    }
}

// Main function
async function main(txData) {
    try {
        const serialized = await createUnsignedTransaction(txData);
        await generateQRCode(serialized);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Helper function to get transaction type name
function getTransactionTypeName(type) {
    switch (type) {
        case 0: return '(Legacy)';
        case 1: return '(EIP-2930 Access List)';
        case 2: return '(EIP-1559)';
        default: return '(Unknown)';
    }
}

// CLI interface for custom transaction data
function parseArgs() {
    const args = process.argv.slice(2);
    const txData = {};
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        if (value) {
            // Handle special cases for different parameter types
            if (key === 'to' || key === 'data') {
                txData[key] = value;
            } else if (key === 'type' || key === 'nonce' || key === 'chainId' || key === 'gasLimit'
                || key === 'maxFeePerGas' || key === 'maxPriorityFeePerGas' || key === 'gasPrice') {
                txData[key] = parseInt(value);
            } else if (key === 'accessList') {
                try {
                    txData[key] = JSON.parse(value);
                } catch (e) {
                    console.warn('Invalid accessList JSON, using empty array');
                    txData[key] = [];
                }
            } else {
                txData[key] = isNaN(value) ? value : parseFloat(value);
            }
        }
    }
    return txData;
}

// If called directly, use CLI args or run example
if (require.main === module) {
    const cliArgs = parseArgs();
    if (Object.keys(cliArgs).length > 0) {
        // Use CLI arguments
        main(cliArgs);
    } else {
        // Show usage examples
        console.log('Usage examples:');
        console.log('Legacy   (Type 0): node src/generate-unsigned-tx.js --type 0 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --gasPrice 20 --nonce 0 --chainId 1');
        console.log('EIP-2930 (Type 1): node src/generate-unsigned-tx.js --type 1 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --gasPrice 20 --nonce 0 --chainId 1');
        console.log('EIP-1559 (Type 2): node src/generate-unsigned-tx.js --type 2 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --maxFeePerGas 2 --maxPriorityFeePerGas 1 --nonce 0 --chainId 1');
        console.log();
        console.log('Examples with Access Lists:');
        console.log('EIP-2930 with Access List: node src/generate-unsigned-tx.js --type 1 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --gasPrice 20 --nonce 0 --chainId 1 --accessList \'[{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","storageKeys":["0x0000000000000000000000000000000000000000000000000000000000000001"]}]\'');
        console.log('EIP-1559 with Access List: node src/generate-unsigned-tx.js --type 2 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --maxFeePerGas 2 --maxPriorityFeePerGas 1 --nonce 0 --chainId 1 --accessList \'[{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","storageKeys":["0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000002"]}]\'');
        console.log();
    }
}

// Export functions for testing or reuse
module.exports = { createUnsignedTransaction, generateQRCode, getTransactionTypeName };
