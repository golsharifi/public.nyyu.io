import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
    Alert,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Chip,
    Box,
    Typography,
    InputAdornment,
} from "@mui/material";
import { Search, Block, CheckCircle, Warning } from "@mui/icons-material";

const CountryManagementPanel = () => {
    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editDialog, setEditDialog] = useState({
        open: false,
        country: null,
    });

    // Query to get all countries with their verification status
    const { data, refetch } = useQuery(GET_COUNTRIES_WITH_SETTINGS, {
        onCompleted: (data) => {
            const countriesData = data.getCountriesWithSettings || [];
            setCountries(countriesData);
            setFilteredCountries(countriesData);
        },
        onError: (error) => {
            setAlert({ type: "error", message: error.message });
        },
    });

    // Mutation to update country settings
    const [updateCountrySettings] = useMutation(UPDATE_COUNTRY_SETTINGS, {
        onCompleted: () => {
            setAlert({
                type: "success",
                message: "Country settings updated successfully",
            });
            refetch();
            setEditDialog({ open: false, country: null });
        },
        onError: (error) => {
            setAlert({ type: "error", message: error.message });
        },
    });

    // Filter countries based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(
                (country) =>
                    country.countryCode
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (country.blockReason &&
                        country.blockReason
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
            );
            setFilteredCountries(filtered);
        }
    }, [searchTerm, countries]);

    const handleQuickToggle = async (countryCode, field, currentValue) => {
        setLoading(true);
        try {
            const country = countries.find(
                (c) => c.countryCode === countryCode,
            );
            await updateCountrySettings({
                variables: {
                    countryCode: countryCode,
                    verificationExempt:
                        field === "exempt"
                            ? !currentValue
                            : country?.verificationExempt || false,
                    blocked:
                        field === "blocked"
                            ? !currentValue
                            : country?.blocked || false,
                    blockReason: country?.blockReason || "",
                    notes: country?.notes || "",
                },
            });
        } catch (error) {
            console.error("Error updating country settings:", error);
        }
        setLoading(false);
    };

    const openEditDialog = (country) => {
        setEditDialog({ open: true, country: { ...country } });
    };

    const handleSaveCountry = async () => {
        if (!editDialog.country) return;

        setLoading(true);
        try {
            await updateCountrySettings({
                variables: {
                    countryCode: editDialog.country.countryCode,
                    verificationExempt:
                        editDialog.country.verificationExempt || false,
                    blocked: editDialog.country.blocked || false,
                    blockReason: editDialog.country.blockReason || "",
                    notes: editDialog.country.notes || "",
                },
            });
        } catch (error) {
            console.error("Error saving country settings:", error);
        }
        setLoading(false);
    };

    const getStatusChip = (country) => {
        if (country.blocked) {
            return (
                <Chip
                    icon={<Block />}
                    label="Blocked"
                    color="error"
                    size="small"
                />
            );
        } else if (country.verificationExempt) {
            return (
                <Chip
                    icon={<CheckCircle />}
                    label="Exempt"
                    color="success"
                    size="small"
                />
            );
        } else {
            return (
                <Chip
                    icon={<Warning />}
                    label="Standard"
                    color="default"
                    size="small"
                />
            );
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Country Verification Management
            </Typography>

            {alert && (
                <Alert
                    severity={alert.type}
                    onClose={() => setAlert(null)}
                    sx={{ mb: 2 }}
                >
                    {alert.message}
                </Alert>
            )}

            <Box
                sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                }}
            >
                <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Blocked Countries:</strong> Cannot perform any
                    operations (deposits, withdrawals, purchases)
                    <br />
                    <strong>Verification Exempt:</strong> Can perform operations
                    without KYC/AML verification
                    <br />
                    <strong>Standard:</strong> Must complete verification when
                    amounts exceed configured thresholds
                </Typography>
            </Box>

            <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                    size="small"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
                <Typography variant="body2" color="text.secondary">
                    {filteredCountries.length} countries
                </Typography>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Country</TableCell>
                            <TableCell align="center">Users</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">
                                Verification Exempt
                            </TableCell>
                            <TableCell align="center">Blocked</TableCell>
                            <TableCell>Block Reason</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCountries.map((country) => (
                            <TableRow key={country.countryCode} hover>
                                <TableCell>
                                    <strong>{country.countryCode}</strong>
                                </TableCell>
                                <TableCell align="center">
                                    {country.userCount || 0}
                                </TableCell>
                                <TableCell align="center">
                                    {getStatusChip(country)}
                                </TableCell>
                                <TableCell align="center">
                                    <Switch
                                        checked={
                                            country.verificationExempt === 1 ||
                                            country.verificationExempt === true
                                        }
                                        onChange={() =>
                                            handleQuickToggle(
                                                country.countryCode,
                                                "exempt",
                                                country.verificationExempt ===
                                                    1 ||
                                                    country.verificationExempt ===
                                                        true,
                                            )
                                        }
                                        disabled={loading || country.blocked}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Switch
                                        checked={
                                            country.blocked === 1 ||
                                            country.blocked === true
                                        }
                                        onChange={() =>
                                            handleQuickToggle(
                                                country.countryCode,
                                                "blocked",
                                                country.blocked === 1 ||
                                                    country.blocked === true,
                                            )
                                        }
                                        disabled={loading}
                                        color="secondary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" noWrap>
                                        {country.blockReason || "-"}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => openEditDialog(country)}
                                    >
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Country Dialog */}
            <Dialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, country: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit Country Settings: {editDialog.country?.countryCode}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        editDialog.country
                                            ?.verificationExempt || false
                                    }
                                    onChange={(e) =>
                                        setEditDialog((prev) => ({
                                            ...prev,
                                            country: {
                                                ...prev.country,
                                                verificationExempt:
                                                    e.target.checked,
                                            },
                                        }))
                                    }
                                />
                            }
                            label="Verification Exempt"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        editDialog.country?.blocked || false
                                    }
                                    onChange={(e) =>
                                        setEditDialog((prev) => ({
                                            ...prev,
                                            country: {
                                                ...prev.country,
                                                blocked: e.target.checked,
                                            },
                                        }))
                                    }
                                />
                            }
                            label="Blocked"
                        />
                        <TextField
                            fullWidth
                            label="Block Reason"
                            multiline
                            rows={2}
                            value={editDialog.country?.blockReason || ""}
                            onChange={(e) =>
                                setEditDialog((prev) => ({
                                    ...prev,
                                    country: {
                                        ...prev.country,
                                        blockReason: e.target.value,
                                    },
                                }))
                            }
                            sx={{ mt: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={editDialog.country?.notes || ""}
                            onChange={(e) =>
                                setEditDialog((prev) => ({
                                    ...prev,
                                    country: {
                                        ...prev.country,
                                        notes: e.target.value,
                                    },
                                }))
                            }
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setEditDialog({ open: false, country: null })
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveCountry}
                        variant="contained"
                        disabled={loading}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CountryManagementPanel;
