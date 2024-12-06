import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const ProposalCard = ({ proposal, onVote, onQueue, onExecute, isAdmin, hasVoted }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { bgColor: '#9333EA20', color: '#9333EA', borderColor: '#9333EA' };
      case 'pending':
        return { bgColor: '#F59E0B20', color: '#F59E0B', borderColor: '#F59E0B' };
      case 'executed':
        return { bgColor: '#10B98120', color: '#10B981', borderColor: '#10B981' };
      case 'defeated':
        return { bgColor: '#EF444420', color: '#EF4444', borderColor: '#EF4444' };
      default:
        return { bgColor: '#9CA3AF20', color: '#9CA3AF', borderColor: '#9CA3AF' };
    }
  };

  const formatVotes = (votes) => {
    return new Intl.NumberFormat().format(votes);
  };

  return (
    <Box className="proposal-card">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ 
            background: 'linear-gradient(135deg, #9333EA, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
            mb: 1
          }}>
            Proposal #{proposal.id.substring(0, 8)}...
          </Typography>
          <Typography sx={{ color: 'var(--text-secondary)', mb: 2 }}>
            {proposal.description}
          </Typography>
        </Box>
        <Box className="status-chip" sx={{ 
          backgroundColor: getStatusColor(proposal.status).bgColor,
          color: getStatusColor(proposal.status).color,
          border: `1px solid ${getStatusColor(proposal.status).borderColor}`
        }}>
          {proposal.status}
        </Box>
      </Box>

      {(proposal.status === "Active" || proposal.status === "Succeeded" || proposal.status === "Defeated") && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>For: {formatVotes(proposal.votesFor)}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Against: {formatVotes(proposal.votesAgainst)}</Typography>
          </Box>
          <Box sx={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              transition: 'width 0.3s ease-in-out'
            }} />
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        {proposal.status === "Active" && !hasVoted && (
          <>
            <Button 
              onClick={() => onVote(proposal.id, 1)}
              className="neon-border"
              sx={{ 
                flex: 1,
                background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  boxShadow: 'var(--neon-glow)'
                }
              }}
            >
              Vote For
            </Button>
            <Button 
              onClick={() => onVote(proposal.id, 0)}
              sx={{ 
                flex: 1,
                border: '1px solid rgba(147, 51, 234, 0.5)',
                color: 'var(--text)',
                '&:hover': {
                  border: '1px solid rgba(147, 51, 234, 0.8)',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)'
                }
              }}
            >
              Vote Against
            </Button>
            <Button 
              onClick={() => onVote(proposal.id, 2)}
              sx={{ 
                flex: 1,
                border: '1px solid rgba(147, 51, 234, 0.5)',
                color: 'var(--text)',
                '&:hover': {
                  border: '1px solid rgba(147, 51, 234, 0.8)',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)'
                }
              }}
            >
              Abstain
            </Button>
          </>
        )}
        {proposal.status === "Succeeded" && isAdmin && (
          <Button 
            onClick={() => onQueue(proposal.id)}
            className="neon-border"
            sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                boxShadow: 'var(--neon-glow)'
              }
            }}
          >
            Queue Proposal
          </Button>
        )}
        {proposal.status === "Queued" && isAdmin && (
          <Button 
            onClick={() => onExecute(proposal.id)}
            className="neon-border"
            sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #9333EA, #EC4899)',
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                boxShadow: 'var(--neon-glow)'
              }
            }}
          >
            Execute Proposal
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProposalCard;
