import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Chip,
    Divider,
    IconButton
} from '@mui/material';
import {
    Edit,
    CheckCircle,
    Error,
    Warning,
    AttachMoney,
    DateRange,
    Person,
    Label,
    Description
} from '@mui/icons-material';
import { format } from 'date-fns';

const TransactionDetails = ({ open, transaction, onClose, onEdit, onMarkPaid }) => {
    if (!transaction) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle />;
            case 'pending': return <Warning />;
            case 'overdue': return <Error />;
            default: return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Transaction Details
                    <IconButton onClick={onEdit} size="small">
                        <Edit />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">
                                    {transaction.description}
                                </Typography>
                                <Chip 
                                    label={transaction.type.toUpperCase()} 
                                    color={transaction.type === 'income' ? 'success' : 'error'}
                                    size="small" 
                                    variant="outlined"
                                />
                            </Box>
                            <Chip 
                                label={transaction.paymentStatus.toUpperCase()} 
                                color={getStatusColor(transaction.paymentStatus)}
                                icon={getStatusIcon(transaction.paymentStatus)}
                            />
                        </Box>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AttachMoney color="action" />
                            <Typography variant="subtitle2" color="textSecondary">
                                Financials
                            </Typography>
                        </Box>
                        <Typography variant="h4" color={transaction.type === 'income' ? 'success.main' : 'error.main'}>
                            ₹{transaction.amount.toLocaleString()}
                        </Typography>
                        {transaction.taxAmount > 0 && (
                            <Typography variant="body2" color="textSecondary">
                                Tax: ₹{transaction.taxAmount}
                            </Typography>
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Method:</strong> {transaction.paymentMethod?.toUpperCase()}
                        </Typography>
                        {transaction.paymentReference && (
                            <Typography variant="body2">
                                <strong>Ref:</strong> {transaction.paymentReference}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DateRange color="action" />
                            <Typography variant="subtitle2" color="textSecondary">
                                Dates
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            <strong>Date:</strong> {format(new Date(transaction.transactionDate), 'dd MMM yyyy')}
                        </Typography>
                        {transaction.dueDate && (
                            <Typography variant="body2">
                                <strong>Due:</strong> {format(new Date(transaction.dueDate), 'dd MMM yyyy')}
                            </Typography>
                        )}
                        {transaction.paymentDate && (
                            <Typography variant="body2">
                                <strong>Paid:</strong> {format(new Date(transaction.paymentDate), 'dd MMM yyyy')}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Label color="action" />
                            <Typography variant="subtitle2" color="textSecondary">
                                Classification
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            <strong>Category:</strong> {transaction.type === 'income' ? transaction.source : transaction.category}
                        </Typography>
                        {transaction.cropName && (
                            <Typography variant="body2">
                                <strong>Crop:</strong> {transaction.cropName}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Person color="action" />
                            <Typography variant="subtitle2" color="textSecondary">
                                Party Details
                            </Typography>
                        </Box>
                        {transaction.party?.name ? (
                            <>
                                <Typography variant="body2">
                                    <strong>Name:</strong> {transaction.party.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Type:</strong> {transaction.party.type}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No party details
                            </Typography>
                        )}
                    </Grid>

                    {transaction.notes && (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Description color="action" />
                                <Typography variant="subtitle2" color="textSecondary">
                                    Notes
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {transaction.notes}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            
            <DialogActions>
                {transaction.paymentStatus !== 'paid' && (
                    <Button 
                        color="success" 
                        variant="contained" 
                        onClick={() => {
                            onMarkPaid();
                            onClose();
                        }}
                    >
                        Mark as Paid
                    </Button>
                )}
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransactionDetails;
