import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Contract, BrowserProvider } from 'ethers';
import { MyGovernorAddr } from '../contract-data/deployedAddresses.json';
import { abi as Govabi } from '../contract-data/MyGovernor.json';

const TokenManager = ({ isAdmin, onUpdate }) => {
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [isDelegateOpen, setIsDelegateOpen] = useState(false);
  const [mintData, setMintData] = useState({
    address: '',
    amount: ''
  });
  const [delegateAddress, setDelegateAddress] = useState('');

  const mintTokens = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const governorContract = new Contract(MyGovernorAddr, Govabi, signer);

      const tx = await governorContract.mint(
        mintData.address,
        mintData.amount
      );

      await tx.wait();
      setIsMintOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  };

  const delegateVotes = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const governorContract = new Contract(MyGovernorAddr, Govabi, signer);

      const tx = await governorContract.delegate(delegateAddress);
      await tx.wait();
      setIsDelegateOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error delegating votes:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {isAdmin && (
          <Button 
            variant="contained"
            onClick={() => setIsMintOpen(true)}
            sx={{ 
              backgroundColor: '#10B981',
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            Mint Tokens
          </Button>
        )}
        <Button 
          variant="contained"
          onClick={() => setIsDelegateOpen(true)}
          sx={{ 
            backgroundColor: '#3B82F6',
            '&:hover': { backgroundColor: '#2563EB' }
          }}
        >
          Delegate Votes
        </Button>
      </Box>

      {/* Mint Dialog */}
      <Dialog 
        open={isMintOpen} 
        onClose={() => setIsMintOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#1F2937',
            color: '#fff'
          }
        }}
      >
        <DialogTitle>Mint Tokens</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Address"
            type="text"
            fullWidth
            value={mintData.address}
            onChange={(e) => setMintData({ ...mintData, address: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={mintData.amount}
            onChange={(e) => setMintData({ ...mintData, amount: e.target.value })}
            sx={{
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMintOpen(false)} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button onClick={mintTokens} sx={{ color: '#3B82F6' }}>
            Mint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog 
        open={isDelegateOpen} 
        onClose={() => setIsDelegateOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#1F2937',
            color: '#fff'
          }
        }}
      >
        <DialogTitle>Delegate Votes</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Delegate Address"
            type="text"
            fullWidth
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            sx={{
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#9CA3AF' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDelegateOpen(false)} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button onClick={delegateVotes} sx={{ color: '#3B82F6' }}>
            Delegate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TokenManager;
