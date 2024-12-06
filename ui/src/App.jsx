import { useState, useEffect } from "react";
import * as React from "react";
import { id, Interface, Contract, BrowserProvider } from "ethers";

import {
  CertAddr,
  MyGovernorAddr,
} from "./contract-data/deployedAddresses.json";
import { abi as Govabi } from "./contract-data/MyGovernor.json";
import { abi as Certabi } from "./contract-data/Cert.json";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";

import Chip from "@mui/material/Chip";

import { experimentalStyled as styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import ProposalCard from './components/ProposalCard';
import CertificatesManager from './components/CertificatesManager';
import TokenManager from './components/TokenManager';

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [votingPower, setVotingPower] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isConnected, setIsConnected] = useState(false);
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [proposalDescription, setProposalDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState("proposals"); // ["proposals", "certificates"]

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setIsConnected(true);
        await updateBalances(accounts[0]);
        await checkAdminStatus(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const updateBalances = async (address) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const governorContract = new Contract(MyGovernorAddr, Govabi, provider);
      const balance = await governorContract.getVotes(address);
      const votePower = await governorContract.getVotingPower(address);
      setBalance(Number(balance));
      setVotingPower(Number(votePower));
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  };

  const checkAdminStatus = async (address) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const governorContract = new Contract(MyGovernorAddr, Govabi, provider);
      const isAdmin = await governorContract.hasRole(id("ADMIN_ROLE"), address);
      setIsAdmin(isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const loadProposals = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const governorContract = new Contract(MyGovernorAddr, Govabi, provider);
      const filter = governorContract.filters.ProposalCreated();
      const events = await governorContract.queryFilter(filter);
      
      const proposalsData = await Promise.all(events.map(async (event) => {
        const proposalId = event.args[0].toString();
        const description = event.args[8];
        const state = await governorContract.state(proposalId);
        const proposalVotes = await governorContract.proposalVotes(proposalId);
        
        return {
          id: proposalId,
          title: description.split('\\n')[0] || 'Untitled Proposal',
          description: description.split('\\n').slice(1).join('\\n') || description,
          status: getProposalState(state),
          votesFor: Number(proposalVotes[0]),
          votesAgainst: Number(proposalVotes[1]),
          votesAbstain: Number(proposalVotes[2])
        };
      }));

      setProposals(proposalsData);
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  };

  const getProposalState = (state) => {
    const states = {
      0: "Pending",
      1: "Active",
      2: "Canceled",
      3: "Defeated",
      4: "Succeeded",
      5: "Queued",
      6: "Expired",
      7: "Executed"
    };
    return states[state] || "Unknown";
  };

  const createProposal = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const governorContract = new Contract(MyGovernorAddr, Govabi, signer);
      const certContract = new Contract(CertAddr, Certabi, signer);

      // Example: Create a proposal to issue a certificate
      const transferCalldata = certContract.interface.encodeFunctionData(
        "issue",
        [Date.now(), "Example", "Certificate", "Type", new Date().toISOString()]
      );

      const proposeTx = await governorContract.propose(
        [CertAddr],
        [0],
        [transferCalldata],
        proposalDescription
      );

      await proposeTx.wait();
      setIsNewProposalOpen(false);
      loadProposals();
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  const castVote = async (proposalId, support) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const governorContract = new Contract(MyGovernorAddr, Govabi, signer);

      const tx = await governorContract.castVote(proposalId, support);
      await tx.wait();
      loadProposals();
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const queueProposal = async (proposalId) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const governorContract = new Contract(MyGovernorAddr, Govabi, signer);

      const tx = await governorContract.queue(proposalId);
      await tx.wait();
      loadProposals();
    } catch (error) {
      console.error("Error queueing proposal:", error);
    }
  };

  const executeProposal = async (proposalId) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const governorContract = new Contract(MyGovernorAddr, Govabi, signer);

      const tx = await governorContract.execute(proposalId);
      await tx.wait();
      loadProposals();
    } catch (error) {
      console.error("Error executing proposal:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadProposals();
      updateBalances(account);
    }
  }, [isConnected, account]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <AppBar position="static" sx={{ 
        backgroundColor: 'transparent', 
        boxShadow: 'none',
        borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
        backdropFilter: 'blur(12px)'
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton edge="start" color="inherit" sx={{ 
              mr: 2,
              '&:hover': {
                boxShadow: 'var(--neon-glow)'
              }
            }}>
              <img 
                src="https://media0.giphy.com/media/RODiNw1qKHct74LACe/200w.gif?cid=6c09b952y24pkqgmvraebmk1z9u5i9ayu0oh0wkja2uv3t6w&ep=v1_gifs_search&rid=200w.gif&ct=g" 
                alt="DAO" 
                style={{ 
                  width: 40, 
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
            </IconButton>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'var(--neon-glow)',
                fontWeight: 600
              }}
            >
              DAO Governance
            </Typography>
            {isConnected && (
              <Box sx={{ mx: 4 }}>
                <Button 
                  sx={{ 
                    color: currentView === "proposals" ? "#9333EA" : "#CBD5E1",
                    mr: 2,
                    '&:hover': {
                      color: '#EC4899',
                      textShadow: 'var(--neon-glow)'
                    }
                  }}
                  onClick={() => setCurrentView("proposals")}
                >
                  Proposals
                </Button>
                <Button 
                  sx={{ 
                    color: currentView === "certificates" ? "#9333EA" : "#CBD5E1",
                    '&:hover': {
                      color: '#EC4899',
                      textShadow: 'var(--neon-glow)'
                    }
                  }}
                  onClick={() => setCurrentView("certificates")}
                >
                  Certificates
                </Button>
              </Box>
            )}
          </Box>
          
          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box className="glass-card" sx={{ 
                padding: '12px 24px',
                display: 'flex',
                gap: 3
              }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Balance</Typography>
                  <Typography sx={{ 
                    background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {balance} Tokens
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Voting Power</Typography>
                  <Typography sx={{ 
                    background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {votingPower}
                  </Typography>
                </Box>
              </Box>
              <TokenManager isAdmin={isAdmin} onUpdate={updateBalances} />
              <Button 
                variant="contained"
                className="neon-border"
                sx={{ 
                  background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                  color: '#fff',
                  fontWeight: 600,
                  padding: '10px 24px',
                  '&:hover': {
                    boxShadow: 'var(--neon-glow)'
                  }
                }}
              >
                Connected
              </Button>
            </Box>
          ) : (
            <Button 
              variant="contained"
              onClick={connectWallet}
              className="neon-border"
              sx={{ 
                background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                color: '#fff',
                fontWeight: 600,
                padding: '10px 24px',
                '&:hover': {
                  boxShadow: 'var(--neon-glow)'
                }
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {!isConnected ? (
          // Welcome Screen
          <Box sx={{ 
            textAlign: 'center', 
            maxWidth: 900, 
            margin: '0 auto',
            mt: 12
          }}>
            <Typography variant="h2" sx={{ 
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'var(--neon-glow)',
              fontWeight: 700,
              mb: 2
            }}>
              Welcome to DAO Governance
            </Typography>
            <Typography variant="h5" sx={{ color: 'var(--text-secondary)', mb: 8 }}>
              Shape the future through decentralized decision-making
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Box className="glass-card" sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 3, fontSize: '2.5rem' }}>📝</Box>
                  <Typography variant="h6" sx={{ 
                    background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Create Proposals
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className="glass-card" sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 3, fontSize: '2.5rem' }}>🗳️</Box>
                  <Typography variant="h6" sx={{ 
                    background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Vote with Tokens
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className="glass-card" sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 3, fontSize: '2.5rem' }}>🔐</Box>
                  <Typography variant="h6" sx={{ 
                    background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Manage Certificates
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Main Content
          <Box>
            {currentView === "proposals" ? (
              // Proposals View
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Typography variant="h4">Proposals</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      sx={{ 
                        backgroundColor: 'var(--background)',
                        color: 'var(--text)',
                        '& .MuiSelect-icon': { color: 'var(--text)' }
                      }}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Executed">Executed</MenuItem>
                    </Select>
                    <Button 
                      variant="contained"
                      startIcon={<span>+</span>}
                      onClick={() => setIsNewProposalOpen(true)}
                      className="neon-border"
                      sx={{ 
                        background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                        color: '#fff',
                        fontWeight: 600,
                        padding: '10px 24px',
                        '&:hover': {
                          boxShadow: 'var(--neon-glow)'
                        }
                      }}
                    >
                      New Proposal
                    </Button>
                  </Box>
                </Box>

                {/* Proposals Cards */}
                <Box sx={{ mt: 3 }}>
                  {proposals.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', color: 'var(--text-secondary)', mt: 4 }}>
                      No proposals found
                    </Typography>
                  ) : (
                    proposals
                      .filter(p => selectedFilter === "All" || p.status === selectedFilter)
                      .map((proposal) => (
                        <ProposalCard 
                          key={proposal.id} 
                          proposal={proposal}
                          onVote={castVote}
                          onQueue={queueProposal}
                          onExecute={executeProposal}
                          isAdmin={isAdmin}
                        />
                      ))
                  )}
                </Box>
              </Box>
            ) : (
              // Certificates View
              <CertificatesManager isAdmin={isAdmin} />
            )}
          </Box>
        )}
      </Box>

      {/* New Proposal Dialog */}
      <Dialog 
        open={isNewProposalOpen} 
        onClose={() => setIsNewProposalOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: 'var(--background)',
            color: 'var(--text)'
          }
        }}
      >
        <DialogTitle>Create New Proposal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Proposal Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={proposalDescription}
            onChange={(e) => setProposalDescription(e.target.value)}
            sx={{
              '& .MuiInputBase-input': { color: 'var(--text)' },
              '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'var(--text-secondary)' },
                '&:hover fieldset': { borderColor: 'var(--text)' },
                '&.Mui-focused fieldset': { borderColor: '#9333EA' }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewProposalOpen(false)} sx={{ color: 'var(--text-secondary)' }}>
            Cancel
          </Button>
          <Button onClick={createProposal} className="neon-border" sx={{ 
            background: 'linear-gradient(135deg, #9333EA, #EC4899)',
            color: '#fff',
            fontWeight: 600,
            padding: '10px 24px',
            '&:hover': {
              boxShadow: 'var(--neon-glow)'
            }
          }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;