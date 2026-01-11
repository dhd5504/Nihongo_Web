import { ethers } from "ethers";

export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";
export const SHOP_ADDRESS = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "";

export const TOKEN_ABI = [
    "function mintWithSignature(uint256 amount, uint256 nonce, uint256 lessonId, bytes calldata signature) external",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)"
];

export const SHOP_ABI = [
    "function buyItem(uint256 _itemId) external",
    "function items(uint256) view returns (uint256 id, string name, uint256 price, bool exists)",
    "function hasPurchased(address, uint256) view returns (bool)"
];

// Ethers v6: Provider type is BrowserProvider or similar, but Contract constructor takes runner (signer/provider)
export const getTokenContract = async (provider: ethers.BrowserProvider) => {
    const signer = await provider.getSigner();
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
}

export const getShopContract = async (provider: ethers.BrowserProvider) => {
    const signer = await provider.getSigner();
    return new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
}
