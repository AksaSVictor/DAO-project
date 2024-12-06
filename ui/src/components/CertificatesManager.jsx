import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip
} from '@mui/material';
import { Contract, BrowserProvider } from 'ethers';
import { CertAddr } from '../contract-data/deployedAddresses.json';
import { abi as Certabi } from '../contract-data/Cert.json';

const CertificatesManager = ({ isAdmin }) => {
  const [certificates, setCertificates] = useState([]);
  const [isNewCertOpen, setIsNewCertOpen] = useState(false);
  const [newCertData, setNewCertData] = useState({
    id: '',
    name: '',
    course: '',
    grade: '',
    date: ''
  });

  const loadCertificates = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const certContract = new Contract(CertAddr, Certabi, provider);
      const filter = certContract.filters.CertificateIssued();
      const events = await certContract.queryFilter(filter);
      
      const certsData = events.map(event => ({
        id: event.args[0].toString(),
        name: event.args[1],
        course: event.args[2],
        grade: event.args[3],
        date: event.args[4]
      }));

      setCertificates(certsData);
    } catch (error) {
      console.error("Error loading certificates:", error);
    }
  };

  const issueCertificate = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const certContract = new Contract(CertAddr, Certabi, signer);

      const tx = await certContract.issue(
        newCertData.id,
        newCertData.name,
        newCertData.course,
        newCertData.grade,
        newCertData.date
      );

      await tx.wait();
      setIsNewCertOpen(false);
      loadCertificates();
    } catch (error) {
      console.error("Error issuing certificate:", error);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">Certificates</Typography>
        {isAdmin && (
          <Button 
            variant="contained"
            onClick={() => setIsNewCertOpen(true)}
            sx={{ 
              backgroundColor: '#3B82F6',
              '&:hover': { backgroundColor: '#2563EB' }
            }}
          >
            Issue Certificate
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        {certificates.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: '#9CA3AF', mt: 4 }}>
            No certificates found
          </Typography>
        ) : (
          certificates.map((cert) => (
            <Paper
              key={cert.id}
              sx={{
                p: 3,
                mb: 2,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{cert.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Course: {cert.course}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Grade: {cert.grade}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Date: {cert.date}
                  </Typography>
                </Box>
                <Chip 
                  label={`ID: ${cert.id}`}
                  sx={{ 
                    backgroundColor: '#3B82F620',
                    color: '#3B82F6'
                  }}
                />
              </Box>
            </Paper>
          ))
        )}
      </Box>

      <Dialog 
        open={isNewCertOpen} 
        onClose={() => setIsNewCertOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#1F2937',
            color: '#fff'
          }
        }}
      >
        <DialogTitle>Issue New Certificate</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Certificate ID"
            type="text"
            fullWidth
            value={newCertData.id}
            onChange={(e) => setNewCertData({ ...newCertData, id: e.target.value })}
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
            label="Name"
            type="text"
            fullWidth
            value={newCertData.name}
            onChange={(e) => setNewCertData({ ...newCertData, name: e.target.value })}
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
            label="Course"
            type="text"
            fullWidth
            value={newCertData.course}
            onChange={(e) => setNewCertData({ ...newCertData, course: e.target.value })}
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
            label="Grade"
            type="text"
            fullWidth
            value={newCertData.grade}
            onChange={(e) => setNewCertData({ ...newCertData, grade: e.target.value })}
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
            label="Date"
            type="date"
            fullWidth
            value={newCertData.date}
            onChange={(e) => setNewCertData({ ...newCertData, date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
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
          <Button onClick={() => setIsNewCertOpen(false)} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button onClick={issueCertificate} sx={{ color: '#3B82F6' }}>
            Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificatesManager;
