# Ethereum Transaction Tools

A JavaScript utility that generates unsigned Ethereum transactions and creates QR codes for easy sharing and scanning. Supports all Ethereum transaction types including Legacy (Type 0), EIP-2930 Access List (Type 1), and EIP-1559 (Type 2) transactions.

There are also tools to decode existing transactions (signed and unsigned), and to sign unsigned transactions.

## Features

- Generate unsigned Ethereum transactions using ethers.js
- Support for all transaction types:
  - **Type 0**: Legacy transactions with gasPrice
  - **Type 1**: EIP-2930 Access List transactions
  - **Type 2**: EIP-1559 transactions with maxFeePerGas and maxPriorityFeePerGas
- Create QR codes from transaction data (PNG format with both string and binary encoding)
- Two QR code variants: string-based and binary-based for optimal compatibility
- Decode and analyze raw transaction data
- Sign unsigned transactions with private keys
- Unique file naming based on transaction content (same content = same filename)
- Command-line interface for custom transactions
- PNG output format for QR codes (512x512 pixels)
- Terminal QR code display for immediate scanning
- Validation for transaction types and required parameters

## Installation

```bash
npm install
```

## Available Scripts

- `npm start` or `npm run generate`: Run the transaction generator
- `npm run decode`: Decode raw transaction data
- `npm run sign`: Sign unsigned transactions

## Usage

### Generate Unsigned Transactions

#### Default Example (Shows Usage Information)

```bash
npm start
# or
node src/generate-unsigned-tx.js
```

This will display usage examples and available commands if no parameters are provided.

#### Legacy Transaction (Type 0)

```bash
node src/generate-unsigned-tx.js --type 0 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --gasPrice 20 --nonce 0 --chainId 1
```

#### EIP-2930 Access List Transaction (Type 1)

```bash
node src/generate-unsigned-tx.js --type 1 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --gasPrice 20 --nonce 0 --chainId 1
```

#### EIP-1559 Transaction (Type 2)

```bash
node src/generate-unsigned-tx.js --type 2 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --maxFeePerGas 2 --maxPriorityFeePerGas 1 --nonce 0 --chainId 1
```

#### With Access List

```bash
node src/generate-unsigned-tx.js --type 1 --to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --value 1 --gasPrice 20 --nonce 0 --chainId 1 --accessList '[{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","storageKeys":["0x0000000000000000000000000000000000000000000000000000000000000001"]}]'
```

### Decode Transactions

```bash
# Decode any transaction type
node src/decode-tx.js 0x02f0018084773594008506fc23ac0082520894d8da6bf26964af9d7eed9e03e53415d37aa9604588016345785d8a000080c0
# or using npm script
npm run decode 0x02f0018084773594008506fc23ac0082520894d8da6bf26964af9d7eed9e03e53415d37aa9604588016345785d8a000080c0
```

### Sign Transactions

```bash
# Sign any transaction type (WARNING: Use test keys only!)
node src/sign-tx.js 0x02f0018084773594008506fc23ac0082520894d8da6bf26964af9d7eed9e03e53415d37aa9604588016345785d8a000080c0 0x1234567890abcdef...
# or using npm script
npm run sign 0x02f0018084773594008506fc23ac0082520894d8da6bf26964af9d7eed9e03e53415d37aa9604588016345785d8a000080c0 0x1234567890abcdef...
```

### Parameters

#### Common Parameters

- `--to`: Recipient address (required)
- `--value`: Amount in wei (default: 0)
- `--gasLimit`: Gas limit (default: 21000)
- `--nonce`: Transaction nonce (default: 0)
- `--chainId`: Chain ID (default: 1 for Ethereum mainnet)
- `--data`: Transaction data (default: 0x)
- `--type`: Transaction type (0, 1, or 2; default: 2)

#### Type-Specific Parameters

##### Legacy (Type 0) and EIP-2930 (Type 1)

- `--gasPrice`: Gas price in gwei (default: 1 gwei)

##### EIP-1559 (Type 2)

- `--maxFeePerGas`: Maximum fee per gas in gwei (default: 2 gwei)
- `--maxPriorityFeePerGas`: Maximum priority fee per gas in gwei (default: 1 gwei)

##### EIP-2930 (Type 1) and EIP-1559 (Type 2)

- `--accessList`: JSON string of access list (optional)

## Transaction Types

### Type 0 - Legacy Transactions

Traditional Ethereum transactions with a single gasPrice field.

### Type 1 - EIP-2930 Access List Transactions

Introduced with the Berlin hard fork, these transactions include an access list that pre-declares the accounts and storage slots the transaction will access, potentially reducing gas costs.

### Type 2 - EIP-1559 Transactions

Introduced with the London hard fork, these transactions use a new fee market mechanism with:

- `maxFeePerGas`: Maximum total fee willing to pay
- `maxPriorityFeePerGas`: Maximum tip for miners
- Dynamic base fee that adjusts based on network congestion

## Output

The program generates:

1. Console output with transaction details including type information
2. Two PNG files containing QR codes of the unsigned transaction:
   - `{unique-id}.png`: String-based QR code
   - `{unique-id}-binary.png`: Binary-based QR code for better compatibility
3. Terminal QR code display for immediate scanning
4. Filename format: `{unique-id}.png` where unique-id is a SHA256 hash of transaction content

## File Structure

```text
src/
├── generate-unsigned-tx.js  # Generate unsigned transactions and QR codes
├── decode-tx.js            # Decode raw transaction data
└── sign-tx.js              # Sign unsigned transactions
```

## Example Output

```text
=== TRANSACTION DETAILS===
Type: 2 (EIP-1559)
To: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Value: 0.000000000000000001 ETH
Gas Limit: 21000
Max Fee Per Gas: 2.0 gwei
Max Priority Fee Per Gas: 1.0 gwei
Nonce: 0
Data: 0x
Chain ID: 1
Access List: []

Unsigned TX: 0x02df0180010282520894d8da6bf26964af9d7eed9e03e53415d37aa960450180c0
Length: 68 bytes
SHA256: 641f22adf6c46fffbe32e9ddf14a9d06ec828d7bd736b2773387ccf3ab5778d1
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀ █▀▀█▄▀██▄▄ ▄█▄▀█ ▄▄▄▄▄ █
█ █   █ █▀ ▄ █▀█▀ ▀▀▀▀▄▀▄██ █   █ █
█ █▄▄▄█ █▀█ █▄█ ▀▀█▀▄█▄▀▄▄█ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█▄█ █▄▀▄█ █ ▀▄█ █▄▄▄▄▄▄▄█
█▄▄▄▄ ▀▄▄  ▄█▄▄▀█▄▄▄▀▀▀▀▀▄ ▀ █ ▀▄▀█
█ ▄█  █▄▀  ▀ ▄█  ▄▄▄█ ▀██▄█▀ ▀▀ ▄▀█
█▄▀ ▀ █▄▄ ▄▀▄▀▄▀▄▀▄▀▀▀▀▀▀▄▀▀▀▄▀▀▀▀█
█  ▄  █▄█▀▄▄█▀██ ▄███ ▀▄█  █ ▄█▀███
█ ▀▀█▄▀▄ ▄▄ █▄▄▀▄▀▄▄▀▀█▀ ▀▀▀▀▄▄▀▀▀█
█ ▄ ▄▀█▄ ▄▄  ▄█▀▄ ██▀  ▀█▄█▀ ██ ███
█▀▀▄█  ▄▄▀ ▀▄▀ ▀▄▄▄▄▀▄▀▀▀▄▀▀▀▄▄▀▀ █
█ ██▄▄ ▄▀█▀ █▀██▄▄▄▄█▀▀▄█▄██▀█▄ ▄██
█▄█▄█▄▄▄█ ▀▄█▄▄▀▄▄▄▄▀▀▀▀▀ ▄▄▄ ▄█▀▀█
█ ▄▄▄▄▄ █▄   ▄██ ▀█▀█▄ ▄▄ █▄█ █ ███
█ █   █ █ ▄ ▄ ▄▄▄▀▄▄ ▄▀▄▀ ▄▄▄ ▄▀▄██
█ █▄▄▄█ █ ▄▀█ ▄▀  █▄▀▀ ▀▀█▄  ██ ▄██
█▄▄▄▄▄▄▄█▄█▄██▄█▄▄▄▄███▄█▄██▄█▄█▄██

QR code (string) saved as: /qr-codes/641f22adf6c46fffbe32e9ddf14a9d06ec828d7bd736b2773387ccf3ab5778d1.png
QR code (binary) saved as: /qr-codes/641f22adf6c46fffbe32e9ddf14a9d06ec828d7bd736b2773387ccf3ab5778d1-binary.png
```

## Notes

- The same transaction data will always generate the same filename (based on SHA256 hash)
- QR codes are 512x512 pixels for optimal scanning
- Two QR code variants are generated: string-based and binary-based encoding
- Supports all Ethereum networks via chainId parameter
- Gas prices are specified in gwei units for CLI parameters
- Private key validation is performed before signing transactions
- Usage examples are displayed when running commands without parameters
